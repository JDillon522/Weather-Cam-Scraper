# Weather Camera Web Scraper

This is just a simple script to scrape weather camera data from the [Canadian Aviation Weather Web Site](https://www.metcam.navcanada.ca/dawc/lb/index.jsp).


## To Run

It will only select provinces listed in the `ALLOWED_PROVINCES` variable at the top of `index.mjs`. The names must match whats on the above site.

```shell
npm install
npm start
```

The results will be saved to `data.json`.

Be warned: this may take a while.

## Data Type
The data will be as follows:

```typescript
[
  {
    name: string; // Province Name
    id: string;
    cameraLocations: [
      {
        id: string;
        title: string; // Name of location
        cameras: [
          {
            id: string;
            name: string;      // "North View", etc
            thumbnail: string; // Img src for camera
            details: {
              title: string;          // The page header
              img: string;
              refImg: string;         // The reference image for the camera
              refImgSubTitle: string; // Additional info for the ref image
            }
          }
        ]
      }
    ]
  }
]
```
