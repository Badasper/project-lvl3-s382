install: 
	npm install 

start:
	npx babel-node -- src/bin/page-loader.js https://hexlet.io/courses

publish:
	npm publish

lint:
	npx eslint .

test:
	npm test -- --coverage

debug:
	DEBUG=page-loader* npm test -- --coverage

watch:
	npm test -- --watchAll

.PHONY: test install
	
