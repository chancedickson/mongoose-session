var MongooseSession = function (mongoose, options) {

    /** Default options **/

    options = options || {};
    options.modelName = options.modelName || 'Session';
    options.ttl = options.ttl || 3600;
	options.collection = options.collection || 'sessions';

    /** Inherits express session prototype store **/

    this.__proto__ = (require('express-session').Store).prototype;
    this.mongoose = mongoose;

    var sessionSchema = new mongoose.Schema({
        _id: String,
        session: mongoose.Schema.Types.Mixed,
        createdAt: (options.ttl ? { type: Date, expires: options.ttl } : Date)
    }, {
		collection: options.collection
	});

    this.SessionModel = mongoose.model(options.modelName, sessionSchema);

    this.get = function(sid, callback) {
        callback = callback || function() {};
        var self = this;
        self.SessionModel.findOne({ _id: sid })
            .exec(function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    if (results) {
                        callback(null, results.session);
                    } else {
                        callback(null);
                    }
                }
            });
    };
    this.set = function(sid, session, callback) {
        callback = callback || function() {};
        var self = this;
        self.SessionModel.update(
            { _id: sid },
            { _id: sid, session: session, createdAt: new Date() },
            { upsert: true },
            function(err) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
    };
    this.destroy = function(sid, callback) {
        callback = callback || function() {};
        var self = this;
        self.SessionModel.remove({ _id: sid })
            .exec(function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
    };
    this.length = function(callback) {
        callback = callback || function() {};
        var self = this;
        self.SessionModel.find()
            .exec(function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    callback(null, results.length);
                }
            });
    };
    this.clear = function(callback) {
        callback = callback || function() {};
        var self = this;
        self.SessionModel.remove()
            .exec(function(err, results) {
                if (err) {
                    console.error(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
    };
};

module.exports = function(mongoose, options) {
    return new MongooseSession(mongoose, options);
};
