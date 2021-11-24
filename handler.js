'use strict';

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

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
      TableName: USERS_TABLE,
      Item: {
        numberOne: 26
      },
    };

    try {
      await dynamoDbClient.put(params).promise();
    } catch (error) {
      console.log(error);
      const response = {
        statusCode: 500,
        body: JSON.stringify("Errore imprevisto: "+error),
    };
    return response;
    }


    const response = {

      statusCode: 200,
      body: JSON.stringify(outputString + " " + risultato + " Table name " + USERS_TABLE),
    };
    return response;
  }
};
