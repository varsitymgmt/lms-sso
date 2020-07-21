import Log from './logger.model';

export function saveLogObject(doc) {
  Log.create([doc])
    .then(docs => {
      if (docs.length > 0) console.info(`logged request successfully`);
    })
    .catch(err => {
      console.error(err);
      console.error(doc);
      console.error(`Error logging request information into database`);
    });
}

export default { saveLogObject };
