/**
 * API
 */
import user from './user';
import auth from './../../auth';
import consumer from './consumer';

export default function(app) {
  //  Insert API below
  app.use('/api/v1/users', user);
  app.use('/auth', auth);
  app.use('/consumer', consumer);
}
