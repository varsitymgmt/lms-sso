/**
 * API
 */
import user from './user';
import auth from './../../auth';

export default function(app) {
  //  Insert API below
  app.use('/api/v1/users', user);
  app.use('/auth', auth);
}
