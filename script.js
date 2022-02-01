const fs = require('fs');
var path = require('path')
const { optimize } = require('svgo');
const sourceFolder = './sourceSvg';
const destinationFile = './icon.exports.js';

const cleanUpSvgData = data => (
    data.replace('fill="#363636"','fill="currentColor"').replace('fill="#156EC7"','fill="currentColor"')
);

const svgTemplate = (fileName, fileData) => (
    `export const ${fileName.split('.').slice(0, -1).join('.')} = (${cleanUpSvgData(fileData)});\n`
);

function copyDataToDestination(destination, data) {
  fs.appendFile(destination, data, (err) => {
    if (err) throw err;
    console.log('The "data to append" was appended to file!');
  });
}

const optimizeSvg = svg => {
    const { data } = optimize(svg, {
        plugins: [
            {name: 'preset-default'},
            {name: 'removeDimensions', active: true},
            {name: 'removeXMLNS', active: true},
        ],
        js2svg: { pretty: true, indent: 2 },
      });
     return data;
};

const writeAllSvgToOneFile = (sourceFolder, destinationFile) => {
    fs.readdir(sourceFolder, (err, files) => {
        if (err) throw err;
        files.forEach(file => {
            try {
                const readData = fs.readFileSync(sourceFolder+'/'+file, 'utf8');
                if (readData && path.extname(file) === '.svg') {
                    copyDataToDestination(destinationFile, svgTemplate(file, optimizeSvg(readData)));
                }
            } catch (error) {
                console.log("something is wrong", error)
            }
        });
    });
}

try {
    if(fs.existsSync(destinationFile) && fs.readFileSync(destinationFile)) {
        console.warn('file exists -> empty file and add the svg data');
        fs.truncate(destinationFile, 0, () => {writeAllSvgToOneFile(sourceFolder, destinationFile)});
    } else {
        writeAllSvgToOneFile(sourceFolder, destinationFile);
    }
  } catch(err) {
    console.error(err)
  }