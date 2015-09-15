# Automatic Salesforce Integration

This is an example app that imports [Automatic](https://automatic.com) trip data into Salesforce. Users can log into both Automatic and Salesforce and then choose trips to export into Salesforce.

It is a node.js app that uses mongodb to store settings.  It relies on the [Automatic REST API](https://developer.automatic.com/api-reference/#rest-api) and the Salesforce API.

## Running Locally

### Install node and gulp

    brew install node

    npm install gulp -g

### Install required packages from NPM and Bower:

    npm install

### Configure your client id and client secret

Copy the file `config-sample.json` to `config.json` and add your config variables.

Automatic client id and client secret can get obtained from the [Automatic Developer site](https://developer.automatic.com).

Salesforce consumer key and secret can be obtained from the [developer section in Salesforce](https://developer.salesforce.com/page/Digging_Deeper_into_OAuth_2.0_on_Force.com).

Get a [mapbox access token](https://www.mapbox.com/signup/) and add it to the `config.json` file.

### Salesforce Object

This example app assumes a salesforce object called `Mileage` with the following custom fields:

* Cost - Currency(16, 2)	 	
* End Location - Text(255)	 	
* Mileage - Number(16, 2)	 	
* Start Location - Text(255)	 	
* Start Time - Date/Time

### Run the app

    DEBUG=automaticsalesforce gulp develop

### View the app

Open `localhost:3000` in your browser.

### Testing locally, skipping OAuth

You can test locally as a logged in user, bypassing OAuth by including an `TOKEN` and `USER_ID` when running the app.

    DEBUG=automaticsaleforce USER_ID=<YOUR_USER_ID> TOKEN=<YOUR-AUTOMATIC-ACCESS-TOKEN> gulp develop

## Deploying

If you have the [heroku toolbelt](https://toolbelt.heroku.com/) installed, you can create, configure and deploy this app to Heroku.  To create an app:

    heroku create

If you already created an app, add it as a git remote:

    git remote add heroku YOUR-HEROKU-GIT-URL

Configure the heroku app's environment variables to include all from `config.json`.

Deploy your app to heroku:

    git push heroku master

See [deploying a node.js app](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction) for more information.

### Support

Please write to developer@automatic.com if you have any questions or need help.

## License

This project is licensed under the terms of the Apache 2.0 license.
