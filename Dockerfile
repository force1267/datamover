FROM node:14-slim AS BUILD_IMAGE

COPY ./package.json /root/backend/services/db2db/package.json
COPY ./yarn.lock /root/backend/services/db2db/yarn.lock
COPY ./.npmrc /root/backend/services/db2db/.npmrc

WORKDIR /root/backend/services/db2db
RUN yarn install --frozen-lockfile --prod

FROM node:14-slim AS RUN_IMAGE

COPY --from=BUILD_IMAGE /root/backend/services/db2db/node_modules /root/backend/services/db2db/node_modules
COPY . /root/backend/services/db2db

WORKDIR /root/backend/services/db2db
ENTRYPOINT ["node", "index.js"]
