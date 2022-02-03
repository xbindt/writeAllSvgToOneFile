const fs = require('fs');
const fsPromises = fs.promises;
var path = require('path')
const { optimize } = require('svgo');
const sourceFolder = './sourceSvg';
const destinationFile = './icon.exports.js';

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

const cleanUpSvgData = (data, name) => (
     data.replace('svg', 'svg data-test="icon-'+name+'"').replace('fill="#363636"','fill="currentColor"').replace('fill="#156EC7"','fill="currentColor"')
);

const generateName = (fileName) => (fileName.split('.').slice(0, -1).join('.'))

const svgTemplate = (fileName, fileData) => {
    const name = generateName(fileName);
    return(`export const ${name} = (${cleanUpSvgData(fileData, name)});\n`);
};

const copyDataToDestination = (destination, data) => new Promise ((resolve) => {
        fs.appendFile(destination, data, (err) => {
            if (err) throw err;
            resolve();
            console.log('The "data to append" was appended to file!');
        })
    }
);

const readFile = (file) => new Promise ((resolve) => {
        const data = fs.readFileSync(file, 'utf8', (err) => {
            if (err) throw err;
        });
        resolve(data)
    }
);


// const copyDataToDestination = (destination, data) => new Promise({
//     fsPromises.appendFile(destination, data, (err) => {
//         if (err) throw err;
//         console.log('The "data to append" was appended to file!');
//     });
// }

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



const processFiles = async (files) => {
    await asyncForEach(files, async (file) => {
    if(path.extname(sourceFolder+'/'+file) === '.svg'){
        const readData = await readFile(sourceFolder+'/'+file);
        await copyDataToDestination(destinationFile, svgTemplate(file, optimizeSvg(readData)));

       }
    });
    console.log('Done');
}

const writeAllSvgToOneFile = (sourceFolder, destinationFile) => {
    const files = fs.readdir(sourceFolder, (err, files) => {
        if (err) throw err;
        processFiles(files);
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