var fs = require('fs');
var LineByLineReader = require("line-by-line");
var readlineSync = require('readline-sync');
var csv = require('csv-string');

var lr;
var whereField;
var fileName;
var selectCriteria;
var whereCriteria;
var header;
var isHeaderFound = false;
var query;
var isQueryGenerated = false;
var whereClauses = [];
var selectCriteriaIndices = [];
var comparisonFileData;
var isComparisonFileRead;
var outputFileName;
var writeStream;
var result = [];
var outputFileParam = {};
var d3Prop = {};

var regex = /(\s==\s|\s=\s|\s>\s|\s<\s|\s>=\s|\s<\s|\s<=\s|\s<>\s|\sin\s)/;
var regex_quotation= /(".*")/;

var selectDataWhere = function(record) {
  var valid = true;
  whereClauses.forEach(function(whereClause,whereClauseIndex,arrayOfWhereClauses) {
    if(regex_quotation.exec(record[whereClause.fieldIndex]))
      whereField = record[whereClause.fieldIndex];
    else
      whereField ='"'+record[whereClause.fieldIndex]+'"';
    if(whereClause.operator != " in ") {
      valid = eval(whereField+whereClause.operator+whereClause.value) && valid;
      //console.log("wf :"+whereField);
      //console.log("whereClause.operator "+whereClause.operator);
      //console.log("Where clause value "+whereClause.value);
    }
    else {
      if(!isComparisonFileRead) {
        comparisonFileData = fs.readFileSync(path.resolve(__dirname,where_value.toString()),'utf8');
        isComparisonFileRead = true;
      }
      if(comparisonFileData.indexOf(whereField) > -1)
        valid = true && valid;
      else {
        valid = false;
      }
    }
    if(valid) {
      selectData(record);
    }
  });
};

var selectData = function(record) {
  //console.log(record);
  var object = {};
  selectCriteriaIndices.forEach(function(element,index,array) {
      object[element.criteria] = record[element.index] == undefined ? 0 : record[element.index];
  });
  //console.log(object);
  result.push(object);
}

var argumentsToArray = function(data) {
  if(data != '') {
    if(data.indexOf(',') < 0) {
      return [data];
    } else {
      return data.split(',');
    }
  }
};

var generateQuery = function() {
  if(selectCriteria == undefined) {
    selectCriteria = header;
    header.forEach(function(element,index,array) {
      selectCriteriaIndices.push({"criteria":element,"index":index});
    });
  }
  else {
    selectCriteria.forEach(function (element,index,array) {
      selectCriteriaIndices.push({"criteria":element,"index":header.indexOf(element)});
    })
  }
  if(whereCriteria == undefined) {
    return selectData;
  }
  else {
    whereCriteria.forEach(function(element,index,array) {
      var whereClause = {};
      var operator = regex.exec(element);
      var whereSpecifications = element.split(operator[0]);
      whereClause["operator"] = operator[0];
      whereClause["value"] = whereSpecifications[1];
      whereClause["fieldIndex"] = header.indexOf(whereSpecifications[0]);
      whereClauses.push(whereClause);
    });
    return selectDataWhere;
  }
}

fileName = readlineSync.question("File Name : ");
lr = new LineByLineReader(fileName);
lr.on('line',function(line) {
  lr.pause();
  if(!isHeaderFound) {
    header = csv.parse(line)[0];
    console.log(header);
    selectCriteria = argumentsToArray(readlineSync.question("Select Criteria : "));
    whereCriteria = argumentsToArray(readlineSync.question("Where Criteria : "));
    outputFileName = readlineSync.question("Output File Name: ");
    d3Prop["x_criteria"] = readlineSync.question("Parameter to be mapped on X-axis :");
    d3Prop["y_criteria"] = readlineSync.question("Parameter to be mapped on Y-axis :");
    query = generateQuery();
    isHeaderFound = true;
  }
  else {
    var record = csv.parse(line)[0]
    query(record);
  }
  lr.resume();
});

lr.on('end',function() {
  outputFileParam["data_domain"] = result;
  outputFileParam["data_rep"] = d3Prop;
  fs.writeFileSync(outputFileName,JSON.stringify(outputFileParam,null,2));
  console.log("Completed!!!");
});
