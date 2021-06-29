<!--lint disable no-literal-urls-->
<h1 align="center">
  SRecord.js
</h1>

A **Highly Experimental and evolving** JavaScript based library to read full S19 strings and create them from an input buffer. The codebase is still under development and is provided without any guarantee, so feel free to contribute to help make it better.

# Table of contents

- [Release Types](#release-types)
  - [Download](#download)
- [Installation](#installation)
- [Security](#security)
- [Contributing](#contributing-to-srecordjs)
- [Support](#support)
- [License](#license)

## Usage Instructions

### Read an S19 string (i.e. read by node-fs)

```js

  import fs from 'fs-extra';
  const file = await fs.readFile(`/path/to/my-s19-file.s19`, 'utf8);

  const response: ReadS19Response = readS19(file, file.length);

  console.log(response.success ? 'Successful!' : `Unsuccesful - ${response.message}`);
  console.log(response.payload?.sRecords);

```

## Convert a buffer to S19 string

```js
const inputContent = "Hello, this is a test of the writeS19 method. This buffer will be converted into an S19 file";
const inputDataBuffer = Buffer.alloc(128);
inputDataBuffer.write(inputContent, "utf8");

const response = writeS19(inputDataBuffer, inputDataBuffer.length, 48, false); //  48 is the length I specified for the data in each S1-3 record (must be between 1-255)

console.log(response.success ? "Successful!" : `Unsuccesful - ${response.message}`);
console.log("S-Record Data:", response.payload);
```

## Release types

- **latest**: Under active development. Code for the latest release is in the
  branch for its major version number.
- **alpha**: Releases that are used solely to test upcoming features and changes. These cannot be guaranteed to be compatible with current releases

Current and LTS releases follow [Semantic Versioning](https://semver.org).

### Download

See [Releases](https://github.com/rsispal/srecord-js/releases) section

## Installation

### Using in your project

#### Via GitHub Package Registry

Ensure you authorise NPM to read from the GitHub Package Registry. The easiest way is to `npm login --registry=npm.pkg.github.com`, but you can also create an `.npmrc` file with the following contents:

```
@rsispal:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN_HERE
```

#### Directly installing Git repository

You can also just directly install the Git repository

Run `npm install --save https://github.com/rsispal/srecord-js`

### From Source

- Clone the project
- Run `npm install`
- Run `npm run build` (production)
- Run `npm run build:dev` (non-production)

## Contributing to SRecord.js

Create a PR if there's any changes and features you can contribute.

## Support

Looking for help? Create an issue and i'll get to you as soon as I can.

## License

[LICENSE](https://github.com/rsispal/srecord-js/blob/master/LICENSE.md) for the full
license text.
