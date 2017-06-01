import { Meteor } from 'meteor/meteor';
import HandlerController from './handler_controller';
import CursorMethods from './cursor';
import { enqueue } from './queue';

const publications = {};
const theses = {};

PublishRelations = function (name, callback) {
  const realPublish = (name, callback) => {
    publications[name] = {
      publication: Meteor.publish(name, function (...params) {
        const handler = new HandlerController();
        const cursors = new CursorMethods(this, handler);

        theses[name] = this;
        this._publicationName = name;
        this.onStop(() => {
          console.log('[PublishRelations] stopping ', name);
          Meteor.server.publish_handlers[name] = null;
          delete Meteor.server.publish_handlers[name];
          handler.stop();
        });

        const cb = callback.apply(_.extend(cursors, this), params);
        // kadira show me alerts when I use this return (but works well)
        // return cb || (!this._ready && this.ready());
        return cb;
      }),
      stop(cb) {
        enqueue( () => theses[name], () => {
          console.log('[PublishRelations] stopping ', name);
          theses[name].stop();
          enqueue( () => !Meteor.server.publish_handlers[name], cb);
        });
      },
    };
  };

  if (publications[name]) {
    publications[name].stop(() => {
      console.log('[PublishRelations] republishing ', name);
      realPublish(name, callback);
    });
    return publications[name];
  }

  realPublish(name, callback);
  return publications[name];
};

Meteor.publishRelations = PublishRelations;

export default PublishRelations;
export { PublishRelations };
