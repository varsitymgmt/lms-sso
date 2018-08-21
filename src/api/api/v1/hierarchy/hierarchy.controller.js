import * as request from 'request';

import { config } from '../../../../config/environment';

export async function validateHierarchyData(args, context) {
  return new Promise(async (resolve, reject) => {
    const url = `${
      config.services.settings
    }/api/instituteHierarchy/create/nodes/forTest`;
    request.post(
      url,
      {
        form: {
          user: JSON.parse(JSON.stringify(context)),
          hierarchy: JSON.stringify(args.hierarchy),
        },
      },
      async (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const hierarchy = JSON.parse(body);
          if (args.hierarchy.totalStudents < 1) {
            const message = 'No students found';
            return reject(message);
          }
          const { nodes } = hierarchy;
          const filteredData = [];
          nodes.forEach(({ isLeafNode, child, childCode, level }) => {
            filteredData.push({
              isLeafNode,
              child,
              childCode,
              level,
            });
          });
          return resolve(filteredData);
        }
        console.error(error);
        const message = 'Something went wrong';
        return reject(message);
      },
    );
  });
}

export default {
  validateHierarchyData,
};
