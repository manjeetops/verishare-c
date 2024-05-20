SHELL=/bin/bash

export PGPASSWORD ?= $(POSTGRES_PASSWORD)

export DB_ENTRY ?= psql -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER)

link_local_dependencies:
	@linklocal -r

start:
	@node ./bin/www

clean:
	@rm -rf ./dist

check-install-deps:
	node ./bin/check-install-dependencies.js

lint:
	./node_modules/.bin/standard --fix

dev: check-install-deps
	@node_modules/.bin/nodemon --inspect=0.0.0.0:9229 ./bin/dev

sync: check-install-deps
	@node_modules/.bin/nodemon --inspect=0.0.0.0:9229 babel-loader.js ./ledger-sync/index.js

start_sync_prod: check-install-deps
	@node ./dist/ledger-sync/index.js

build: clean
	@npx babel . -d ./dist -s \
		--copy-files \
		--extensions ".js,.jsx,.ts,.tsx" \
		--verbose \
		--ignore dist,node_modules,yarn-v1.5.1,__mocks__,chart,node_modules,common/node_modules,postman,test

start_prod_server:
	@node dist/main.js

set-up-db:
	@$(DB_ENTRY) ${DEFAULT_DB} -c 'CREATE DATABASE "${DB_NAME}"';

run-migration:
	@$(DB_ENTRY) ${DEFAULT_DB} -c 'CREATE DATABASE "${DB_NAME}"';

test:
	@node_modules/.bin/mocha --timeout 10000 ./tests/specs/**.spec.js --require @babel/register
