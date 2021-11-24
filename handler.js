'use strict';

const AWS = require('aws-sdk');

const TABLE = process.env.USERS_TABLE;
const DYNAMODB = new AWS.DynamoDB.DocumentClient()

module.exports = {
  matematic: async (event) => {

    let bodyObj = {}
    try {
      bodyObj = JSON.parse(event.body)
    } catch (jsonError) {
      console.log('There was an error parsing the body - C è un errore', jsonError)
      return {
        statusCode: 400
      }
    }


    var number = bodyObj.int;
    var number2 = bodyObj.int2;
    var operator = bodyObj.operator;


    if ((number === undefined) || (number2 === undefined) && (operator != "^")) {
      operator = " ";
    }

    switch (operator) {
      case '+':
        var risultato = number + number2;
        break;
      case '-':
        var risultato = number - number2;
        break;
      case '*':
        var risultato = number * number2;
        break;
      case '/':
        var risultato = number / number2;
        break;
      case '^':
        var risultato = number * number;
        break;
      default:
        return {
          statusCode: 200,
          body: JSON.stringify(`Qualcosa è andato storto` + number + " " + event.int + " even.body " + event.body + " event.int " + event.int),
        };
    }

    var outputString = `L'operazione di ${operator} tra ${number} è ${number2} da come risultato `;

    if (operator === "^") {
      outputString = `Il quadrato di ${number} da come risultato `;
    }

    const params = {
      TableName: TABLE,
      Item: {
        numberOne: risultato.toString()
      },
    };

    try {
      await DYNAMODB.put(params).promise();
    } catch (error) {
      console.log(error);
      const response = {
        statusCode: 500,
        body: JSON.stringify("Errore imprevisto: " + error),
      };
      return response;
    }


    const response = {

      statusCode: 200,
      body: JSON.stringify(outputString + " " + risultato + " Table name " + TABLE),
    };
    return response;
  },
  list: async (event) => {

    let scanParams = {
      TableName: TABLE
    }
    let scanResult = {}
    try {
      scanResult = await DYNAMODB.scan(scanParams).promise()
    } catch (error) {
      console.log('Ci sono problemi nella lettura del database: ' + error + " Questi i parametri del DB :" + scanParams.TableName)
      const response = {
        statusCode: 500,
        body: JSON.stringify("Errore imprevisto: " + error + " Questi i parametri del DB :" + scanParams),
      };
      return response;
    }

    if (scanResult.Items === null || !Array.isArray(scanResult.Items) || scanResult.Items.length === 0) {
      const response = {
        statusCode: 404,
        body: JSON.stringify("Errore nel contenuto: " + scanResult.Items),
      };
      return response;
    }
    return {
      statusCode: 200,
      body: JSON.stringify(scanResult.Items.map(matematic => {
        return {
          number: matematic.numberOne
        }
      }))
    }
  },
  get: async (event) => {
    let getParams = {
      TableName: TABLE,
      Key: {
        numberOne: event.pathParameters.name.toString()
      }
    }

  

    let getResult = {}
    try {
      getResult = await DYNAMODB.get(getParams).promise()
    } catch (error) {
      console.log('Ci sono problemi nella lettura del database: ' + error + " Questi i parametri del DB :" + getParams.TableName)
      const response = {
        statusCode: 500,
        body: JSON.stringify("Errore imprevisto: " + error + " Questi i parametri del DB :" + getParams.TableName),
      };
      return response;
    }

    
    
    if (getResult.Item === undefined) {
      const response = {
        statusCode: 404,
        body: JSON.stringify("L'elemento non è presente nel database" ),
      };
      return response;
    }

    // const response = {
    //   statusCode: 500,
    //   body: JSON.stringify("Errore imprevisto: Questi i parametri del DB :" + getParams.TableName),
    // };
    // return response;
    
    return {
      statusCode: 200,
      body: JSON.stringify("La chiave che cerchi è: "+getResult.Item.numberOne)
    }
  },
};
