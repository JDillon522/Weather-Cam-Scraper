import puppeteer from 'puppeteer';
import { writeFile } from 'fs';
import { exit } from 'process';

const browser = await puppeteer.launch({ headless: true, devtools: true });

// Add desired provinces here
const ALLOWED_PROVINCES = [
  'Northwest Territories'
]


// Create the list of provinces and their camera locations
const getProvinces = async () => {
  console.log('Getting provinces...')
  const page = await browser.newPage();
  await page.goto('https://www.metcam.navcanada.ca/dawc/lb/index.jsp');

  let provinces = await page.$$eval('.province', (elements) => {
    const data = [];

    elements.forEach(province => {
      const name = province.innerText?.trim();
      const id = province.querySelector('input').id;


      data.push({
        name: name,
        id: id,
        cameraLocations: []
      });
    });

    return data;
  });

  // Filter out the provinces we dont want
  provinces = provinces.filter(province => ALLOWED_PROVINCES.includes(province.name));

  // Add the province camera locations
  for await (let province of provinces) {
    console.log(`PROVINCE: ${province.name}...`);

    province.cameraLocations = await page.$$eval(`#camSite${province.id} table .site`, (locations) => {
      const cameraLocations = [];

      locations.forEach(async location => {
        const id = location.href?.replace(/.+id=/, '');
        const title = location.innerText?.trim();
        const cameras = []

        cameraLocations.push({
          id: id,
          title: title,
          cameras: cameras
        });
      });

      return cameraLocations;
    });

    // Get the thumbnails for each location's camera
    for await (const location of province.cameraLocations) {
      console.log(`-- Location: ${location.title}`)
      const cameras = await getLocationCameras(location.id);
      location.cameras = cameras;
    }

  };

  return provinces;
}


const getLocationCameras = async (locationId) => {
  const locationPage = await browser.newPage();
  await locationPage.goto(`https://www.metcam.navcanada.ca/dawc/lb/cameraSite.jsp?lang=e&id=${locationId}`);

  const cameras = await locationPage.$$eval('div[align="center"]:not(.corps)', (items) => {
    const cameras = [];

    items.forEach(item => {

      const name = item.querySelector('.corps');
      const a = item.querySelector('a');
      const img = item.querySelector('img');

      if (name) {
        cameras.push({
          id: a.href?.replace(/.+id=/, ''),
          name: name.innerText,
          thumbnail: img.src?.replace(/\?.+/, '')
        })
      }
    })

    return cameras
  });

  // Get the details for each camera
  for await (let camera of cameras) {
    console.log(`---- DETAILS: ${camera.name}`)
    camera.details = await getCameraDetail(camera.id);
  }

  return cameras;
}

const getCameraDetail = async (cameraId) => {
  const detailPage = await browser.newPage();

  await detailPage.goto(`https://www.metcam.navcanada.ca/dawc/lb/camera.jsp?lang=e&id=${cameraId}`);

  const details = await detailPage.$eval('body', (body) => {
    const title = body.querySelector('.titre')?.innerText?.trim();
    const img = body.querySelector('img[id*="cam"]')?.src?.replace(/\?.+/, '');
    const refImgSubTitle = body.querySelector('.title_medium')?.innerText?.trim();
    const refImg = body.querySelector('#ref_image')?.src?.replace(/\?.+/, '');

    return {
      title: title,
      img: img,
      refImg: refImg,
      refImgSubTitle: refImgSubTitle
    }
  });

  return details;
}


(async () => {
  const provinces = await getProvinces();

  writeFile('data.json', JSON.stringify(provinces), (err) => {
    if (err) {
      throw err;
    }

    console.log('COMPLETE');
    exit(0);
  })

})()

