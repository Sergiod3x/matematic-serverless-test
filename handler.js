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
      console.log("Impossibile recuperare i parametri dal body", jsonError)
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
  create: async (event) => {

    let bodyObj = {}
    try {
      bodyObj = JSON.parse(event.body)
    } catch (error) {
      console.log('Ci sono dei problemi nel recuperare le chiavi' + error)
      const response = {
        statusCode: 400,
        body: JSON.stringify('Ci sono dei problemi nel recuperare le chiavi: ' + error)
      };
      return response;
    }

    var numberOne = bodyObj.numberOne;
    var numberTwo = bodyObj.numberTwo;

    if (numberOne === undefined || numberTwo === undefined) {
      console.log('Parametri mancanti')
      const response = {
        statusCode: 400,
        body: JSON.stringify(numberOne + " o " + numberTwo + ' sono nulli')
      };
      return response;
    }

    const params = {
      TableName: TABLE,
      Item: {
        numberOne: numberOne.toString(),
        numberTwo: numberTwo.toString()
      },
    };

    try {
      await DYNAMODB.put(params).promise();
    } catch (error) {
      console.log(error);
      const response = {
        statusCode: 500,
        body: JSON.stringify("Errore imprevisto nel caricare le chiavi " + numberOne + " sul database: " + error),
      };
      return response;
    }

    const response = {

      statusCode: 200,
      body: JSON.stringify("Chiave " + numberOne + " caricata sulla tabella " + TABLE),
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
      console.log('Ci sono problemi nella lettura del database: ' + error + " Questi i parametri del DB :" + scanParams)
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
          number: matematic.numberOne,
          numberTwo: matematic.numberTwo
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
        body: JSON.stringify("L'elemento non è presente nel database"),
      };
      return response;
    }

    return {
      statusCode: 200,
      body: JSON.stringify("La chiave che cerchi è: " + getResult.Item.numberOne + " e il valore numberTwo a essa legato è: " + getResult.Item.numberTwo)
    }
  },
  update: async (event) => {
    let bodyObj = {}
    try {
      bodyObj = JSON.parse(event.body)
    } catch (error) {
      console.log('Ci sono dei problemi nel recuperare le chiavi' + error)
      const response = {
        statusCode: 400,
        body: JSON.stringify('Ci sono dei problemi nel recuperare le chiavi: ' + error)
      };
      return response;
    }

    var numberTwo = bodyObj.numberTwo;

    if (numberTwo === undefined) {
      console.log('Parametro mancante')
      const response = {
        statusCode: 400,
        body: JSON.stringify(numberTwo + ' è nullo')
      };
      return response;
    }

    let updateParams = {
      TableName: TABLE,
      Key: {
        numberOne: event.pathParameters.name.toString()
      },
      UpdateExpression: 'set numberTwo = :numberTwo',
      ExpressionAttributeName: {
        'numberTwo': 'numberTwo'
      },
      ExpressionAttributeValues: {
        ':numberTwo': numberTwo
      }
    }
    let updateResult = {}
    try {
      updateResult = DYNAMODB.update(updateParams).promise()
    } catch (error) {
      console.log('Ci sono problemi a aggiornare il valore')
      const response = {
        statusCode: 500,
        body: JSON.stringify("Ci sono problemi a aggiornare il valore " + err)
      };
      return response;
    }
    if (updateResult.Items === null) {
      return {
        statusCode: 404
      }
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify("Il valore modificato è: " + updateParams.Key.numberOne + ' ' + numberTwo)
    };
    return response;

  },
  delete: async (event) => {
    let deleteParams = {
      TableName: TABLE,
      Key: {
        numberOne: event.pathParameters.name.toString()
      }
    }

    let getResult = {}
    try {
      getResult = await DYNAMODB.get(deleteParams).promise()
    } catch (error) {
      console.log('Ci sono problemi nella lettura del database: ' + error + " Questi i parametri del DB :" + deleteParams.TableName)
      const response = {
        statusCode: 500,
        body: JSON.stringify("Errore imprevisto: " + error + " Questi i parametri del DB :" + deleteParams.TableName),
      };
      return response;
    }



    if (getResult.Item === undefined) {
      const response = {
        statusCode: 404,
        body: JSON.stringify("L'elemento " + deleteParams.Key.numberOne + " non è presente nel database"),
      };
      return response;
    }

    let deleteResult = {}
    try {
      deleteResult = await DYNAMODB.delete(deleteParams).promise()
    } catch (error) {
      console.log("Ci sono problemi nell'eliminazione della chiave dal database: " + error)
      const response = {
        statusCode: 500,
        body: JSON.stringify("Errore imprevisto: " + error + "Ci sono problemi nell'eliminazione della chiave dal database "),
      };
      return response;
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify("L'elemento " + deleteParams.Key.numberOne + " è stato eliminato dal database "),
    };
    return response;
  }
};
