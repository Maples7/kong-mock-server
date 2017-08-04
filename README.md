# kong-mock-server
It's a mock server who behaves the same way as [Kong's Admin APIs](https://getkong.org/docs/0.10.x/admin-api/). It's originally intended to test npm package [`kong-config-manager`](git@github.com:Maples7/kong-mock-server.git).

**NOTE**: 

1. This server would **NOT** check whether what you create for Kong is legal or makes any sense. That's to say, it only does the basic APIs' stuff but **NOT** the full Kong's logic.

2. Not all Admin APIs are mocked for now. Basically, APIs like GET all items and POST, PATCH or DELETE a item are supported. If you want more, please try to fork this repo and raise your PRs.

3. Use `id` as identify field for all APIs. If there is NO `id`, then try to use `name` field.

## Usage

You have several choices:

### As a git submodule

In this way, you don't need to download the npm package and `require` it, but just use it as a git submodule. See [Git - git-submodule Documentation](https://git-scm.com/docs/git-submodule) for more information about git submodule in case you haven't heard about it yet.

Then, run `git submodule add git@github.com:Maples7/kong-mock-server.git` to add it as a git submodule to your project.

The good thing of this way is you can start up the mock server via `node kong-mock-server/index` totally independently with listening on port 3001. Watch out the thread stuff.

You are welcome to see [kong-config-manager](https://github.com/Maples7/kong-config-manager) for an example usage case of this way.

### As a npm package

In this way, the package would export an [Express](http://expressjs.com/) instance created by `const app = require('express')()`. So if you use some test framework like [ava](https://github.com/avajs/ava), you no longer need to start up a independent server but just use the exported `app` to achieve your request and response stuff.

Use `npm i kong-mock-server --save-dev` to install it as a developing dependence package.

## About Version

This project mocks version **0.10.x** of Kong, any other versions are NOT guaranteed. Theoretically, once the Admin APIs of Kong remain unchanged, it would work well. But again, nothing is determined for sure.

## Relatives

- [kong-config-manager](https://github.com/Maples7/kong-config-manager)

## License
[GPLv3](LICENSE)
