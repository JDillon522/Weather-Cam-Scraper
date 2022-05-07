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
