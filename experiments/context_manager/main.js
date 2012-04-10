var path = require('path');
var util = require('util');
var commonPaths = require(path.resolve(__dirname, '../../webinos/common/manager/context_manager/') + '/lib/commonPaths.js');
commonPaths.localTest = path.resolve(__dirname) + '/';
var sqlite3 = require(commonPaths.local + '/node_modules/node-sqlite3').verbose();

var dbpath = path.resolve(commonPaths.storage + '/pzh/contextDB.db');
var db =  new sqlite3.Database(dbpath);

var query = {
	select: '*',
	where:[{
		type:'and',
		field:'MyPositions.altitude@GeolocationAPI',
		op: 'le',
		value:'1',
	},{
		type:'and',
		field:'MyPositions.altitude',
		op: 'le',
		value:'1',
	},{
		type:'and',
		field:'fldContextObject',
		op: 'eq',
		value:'MyPositions',
		sub:[{
			type:'and',
			field:'fldValueName',
			op: 'eq',
			value:'altitude',
			sub:[{
				type:'and',
				field:'fldValue',
				op: 'le',
				value:'1'
			}]
		}]
	}]
};
//SELECT * FROM vwcontextraw WHERE fldcontextrawID IN (
//		select fldcontextrawID from  vwcontextraw, (SELECT fldcontextrawID as inID , (fldTimestamp-100) as fromT, (fldTimestamp+100) as toT FROM vwcontextraw 
//			WHERE 0=0 AND ( fldContextObject = 'MyPositions' AND ( fldValueName = 'altitude' AND ( fldValue <= '1' ) ) AND ( fldAPI = 'GeolocationAPI' ) ) ) s Where fldTimestamp <= s.toT and  fldTimestamp >= s.fromT  
//		 
//		) 
function prepareSql(query){
	if (!query.sql) query.sql = "";
	query.sql += "SELECT * FROM vwcontextraw WHERE fldcontextrawID IN (";
	query.sql += "SELECT fldcontextrawID FROM vwcontextraw WHERE 0=0";
	query.sql += prepareFilters(query.where);
	query.sql += ")";
	
}
function prepareFilters(filters){
	var out = "";
	for (var filter, i = -1; filter = filters[++i];){
		filter = fixFilter(filter);
		out+=" "+((filter.type=='and')?"AND":"OR")+" ( "+filter.field+"";
		switch (filter.op){
		case "eq":
			out+=" = '"+filter.value+"'";
			break;
		case "le":
			out+=" <= '"+filter.value+"'";
			break;
		}
		if (filter.sub && filter.sub instanceof Array)
			out+= prepareFilters(filter.sub);
		out+=" )";
	}
	return out;
}
function fixFilter(filter){//fldContextObject.fldValueName@fldAPI
	var input = filter;
	if (input.field.indexOf('.')<0) return input;
	input.field = input.field.split('.');
	input.field[1] = input.field[1].split('@');
	var out = {
		type : input.type,
		field : 'fldContextObject',
		op : 'eq',
		value : input.field[0],
		sub : []
	};
	out.sub[0] = {
		type : 'and',
		field : 'fldValueName',
		op : 'eq',
		value : input.field[1][0],
		sub : [{
			type : 'and',
			field : 'fldValue',
			op : input.op,
			value : input.value
		}]
	};
	if (input.field[1][1]){
		out.sub[1] = {
			type : 'and',
			field : 'fldAPI',
			op : 'eq',
			value : input.field[1][1]
		};
	}
	filter = out;
	return out;
}
prepareSql(query);
console.log(query.sql);
var result = {data:[]};
db.each(
	//"SELECT * FROM vwcontextraw WHERE fldcontextrawID IN (SELECT fldcontextrawID FROM vwcontextraw WHERE " +
	//"fldValueName = 'altitude' AND fldValue <= 1" +
//	"fldcontextrawID > '1'" +
//	"fldAPI = 'TVAPI2'" +
	//")", 
		query.sql,
	function (err,row){
		result.data[result.data.length] = row;
	},
	function(err){
		if (err !== null) {
			result.msg = {code:err.code,msg:err.message};
			console.log("ERROR");
			console.log(result);
		}else{
			processResults(result.data);
		}
	}
);

function processResults(result){
	 console.log("\n========================================================\n");
	 
	 var results = [];
	 var resultsIndex = -1;
	 var rawData = [];
	 var rawDataIndex = -1;
	 var curIndex= (result[0])?result[0].fldcontextrawID : null;

	 var saveData = function (myRawData){
		 	if (curIndex == null) return;
	  results[++resultsIndex] = {
	   fldcontextrawID:curIndex,
	   rawData:myRawData
	  };
	 }
	 for (var row, i = -1; row = result[++i];){
	  if(row.fldcontextrawID!=curIndex){
	     
	   saveData(rawData);
	   curIndex=row.fldcontextrawID;
	   rawData=[];
	   rawDataIndex = -1;
	  }
	  rawData[++rawDataIndex] = row;
	     
	 }
	 saveData(rawData);
	 
	 for (var result, i = -1; result = results[++i];){
//		 console.log(util.inspect(result, false, null));
		 results[i].values = {};
		 results[i].API = results[i].rawData[0].fldAPI;
		 results[i].Device = results[i].rawData[0].fldDevice;
		 results[i].Application = results[i].rawData[0].fldapplication;
		 results[i].Session = results[i].rawData[0].fldSession;
		 results[i].Timestamp = results[i].rawData[0].fldTimestamp;
		 results[i].ContextObject = results[i].rawData[0].fldContextObject;
		 results[i].Method = results[i].rawData[0].fldMethod;
		 
		 var parentObjType = {"0":{'type':'o','obj':results[i].values}};
		 normalizeResult(result, 0, "0", parentObjType);
		 delete(results[i].rawData);
	 }
	 
//	 console.log(util.inspect(results, false, null));
//	 console.log(util.inspect(parentObjType, false, null));
	 console.log(JSON.stringify(results));
	 
	}
function normalizeResult(result, index, parentObjRef, parentObjType) {
	while (result.rawData[index] != undefined){
		var row = result.rawData[index];
		parentObjRef = (row.ObjectRef=="0")?"0":row.ObjectRef.substring(0,row.ObjectRef.lastIndexOf(".")+1);
		var parent = parentObjType[parentObjRef];
//		console.log("parentObjRef: "+parentObjRef);
//		console.log(index+"\t"+parentObjRef+"\t"+row.ObjectRef+"\t"+row.fldValueType+"\t"+row.fldValueName + "\t" + row.fldValue);
		index++;
		
		var parentIndex = null;
		if (row.fldValueType=='array'){
			parentObjRef = row.fldValue;
//console.log("this ObjRef: "+parentObjRef);
			if (row.fldValueName == "") row.fldValueName = row.fldDescription;
			row.fldValue = [];
			var parObj;
			switch (parent.type){
			case 'o':
				parObj = parent.obj;
				break;
			case 'a':
				var _i = row.ObjectRef.substring(row.ObjectRef.lastIndexOf(".")+1);
				if (parent.obj.length==_i)
					parent.obj[_i] = {};
				parObj = parent.obj[_i];
				break;
			}
			parObj[row.fldValueName] = row.fldValue;
			parentObjType[parentObjRef]={'type':'a','obj':parObj[row.fldValueName],'index':0};
		}else{
			var parObj;
			switch (parent.type){
			case 'o':
				parObj = parent.obj;
				break;
			case 'a':
				var _i = row.ObjectRef.substring(row.ObjectRef.lastIndexOf(".")+1);
				if (parent.obj.length==_i)
					parent.obj[_i] = {};
				parObj = parent.obj[_i];
				break;
			}
			parObj[row.fldValueName] = row.fldValue;
		}
		
		index = normalizeResult(result, index, parentObjRef, parentObjType);
	}
	return index;
}
