import React from 'react';
import { StyleSheet, Text, View, ListView } from 'react-native';

import SQLite from 'react-native-sqlite-storage';
SQLite.DEBUG(true);
SQLite.enablePromise(true);
let db;

export default class App extends React.Component {
  constructor() {
    super();
    this.progress = [];
    this.state = {
      progress: [],
      ds: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2}
      )
    };
  }

  updateProgress = (text, resetState) => {
    let progress = [];
    if (!resetState) {
      progress = [...this.progress];
    }
    progress.push(text);
    this.progress = progress;
    this.setState({
      progress
    });
  }

  componentWillUnmount(){
    this.closeDatabase();
  }

  errorCB = (err) => {
    console.log("error: ",err);
    this.updateProgress("Error " + (err.message || err));
  }

  populateDatabase = (db) => {
    this.updateProgress("Database integrity check")
    this.updateProgress("select * from antes")
    db.executeSql('select * from sqlite_master').then(([results]) =>{
      this.updateProgress("Database is ready ... executing query ...");
      this.updateProgress(JSON.stringify(results.rows.length));
    }).catch((error) =>{
      console.log("Received error: ", error)
      this.updateProgress(JSON.stringify(error));
      /*db.transaction(this.populateDB).then(() =>{
        this.updateProgress("Database populated ... executing query ...")
        db.transaction(this.queryEmployees).then((result) => {
          console.log("Transaction is now finished");
          this.updateProgress("Processing completed");
          this.closeDatabase()});
      });*/
    });
  }

  populateDB = (tx) => {
    this.updateProgress("Executing DROP stmts")

    tx.executeSql('DROP TABLE IF EXISTS Employees;');
    tx.executeSql('DROP TABLE IF EXISTS Offices;');
    tx.executeSql('DROP TABLE IF EXISTS Departments;');


    this.updateProgress("Executing CREATE stmts");


    tx.executeSql('CREATE TABLE IF NOT EXISTS Version( '
      + 'version_id INTEGER PRIMARY KEY NOT NULL); ').catch((error) => {
      this.errorCB(error)
    });

    tx.executeSql('CREATE TABLE IF NOT EXISTS Departments( '
      + 'department_id INTEGER PRIMARY KEY NOT NULL, '
      + 'name VARCHAR(30) ); ').catch((error) => {
      this.errorCB(error)
    });

    tx.executeSql('CREATE TABLE IF NOT EXISTS Offices( '
      + 'office_id INTEGER PRIMARY KEY NOT NULL, '
      + 'name VARCHAR(20), '
      + 'longtitude FLOAT, '
      + 'latitude FLOAT ) ; ').catch((error) => {
      this.errorCB(error)
    });

    tx.executeSql('CREATE TABLE IF NOT EXISTS Employees( '
      + 'employe_id INTEGER PRIMARY KEY NOT NULL, '
      + 'name VARCHAR(55), '
      + 'office INTEGER, '
      + 'department INTEGER, '
      + 'FOREIGN KEY ( office ) REFERENCES Offices ( office_id ) '
      + 'FOREIGN KEY ( department ) REFERENCES Departments ( department_id ));').catch((error) => {
      this.errorCB(error)
    });

    this.updateProgress("Executing INSERT stmts")


    tx.executeSql('INSERT INTO Departments (name) VALUES ("Client Services");');
    tx.executeSql('INSERT INTO Departments (name) VALUES ("Investor Services");');
    tx.executeSql('INSERT INTO Departments (name) VALUES ("Shipping");');
    tx.executeSql('INSERT INTO Departments (name) VALUES ("Direct Sales");');

    tx.executeSql('INSERT INTO Offices (name, longtitude, latitude) VALUES ("Denver", 59.8,  34.1);');
    tx.executeSql('INSERT INTO Offices (name, longtitude, latitude) VALUES ("Warsaw", 15.7, 54.1);');
    tx.executeSql('INSERT INTO Offices (name, longtitude, latitude) VALUES ("Berlin", 35.3, 12.1);');
    tx.executeSql('INSERT INTO Offices (name, longtitude, latitude) VALUES ("Paris", 10.7, 14.1);');

    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Sylvester Stallone", 2,  4);');
    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Elvis Presley", 2, 4);');
    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Leslie Nelson", 3,  4);');
    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Fidel Castro", 3, 3);');
    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Bill Clinton", 1, 3);');
    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Margaret Thatcher", 1, 3);');
    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Donald Trump", 1, 3);');
    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Dr DRE", 2, 2);');
    tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Samantha Fox", 2, 1);');
    console.log("all config SQL done");
  }

  queryEmployees = (tx) => {
    console.log("Executing employee query");
    tx.executeSql('SELECT a.name, b.name as deptName FROM Employees a, Departments b WHERE a.department = b.department_id and a.department=?', [3]).then(([tx,results]) => {
      this.updateProgress("Query completed")
      var len = results.rows.length;
      for (let i = 0; i < len; i++) {
        let row = results.rows.item(i);
        this.updateProgress(`Empl Name: ${row.name}, Dept Name: ${row.deptName}`)
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  loadAndQueryDB = () => {
    this.updateProgress("Plugin integrity check ...");
    SQLite.echoTest().then(() => {
      this.updateProgress("Integrity check passed ...")
      this.updateProgress("Opening database ...")
      SQLite.openDatabase({name : "SQLiteCipher.sqlite", readOnly: true, createFromLocation : "~data/SQLiteCipher.sqlite"}).then((DB) => {
        db = DB;
        this.updateProgress("Database OPEN");
        this.populateDatabase(DB);
      }).catch((error) => {
        this.updateProgress("Error database ...")
        console.log(error);
      });
    }).catch(error => {
      this.updateProgress("echoTest failed - plugin not functional");
    });
  }

  closeDatabase = () => {
    if (db) {
      console.log("Closing database ...");
      this.updateProgress("Closing DB")
      db.close().then((status) => {
        this.updateProgress("Database CLOSED");
      }).catch((error) => {
        this.errorCB(error);
      });
    } else {
      this.updateProgress("Database was not OPENED")
    }
  }

  deleteDatabase = () => {
    this.updateProgress("Deleting database")
    SQLite.deleteDatabase(database_name).then(() => {
      console.log("Database DELETED");
      this.updateProgress("Database DELETED")
    }).catch((error) => {
      this.errorCB(error);
    });
  }

  runDemo = () => {
    console.log('running');
    this.updateProgress("Starting SQLite Promise Demo",true);
    this.loadAndQueryDB();
  }

  renderProgressEntry = (entry) => {
    return (<View style={listStyles.li}>
      <View>
        <Text style={listStyles.liText}>{entry}</Text>
      </View>
    </View>)
  }

  render(){
    let ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2 });
    return (<View style={styles.mainContainer}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarButton} onPress={this.runDemo}>
          Run Demo
        </Text>
        <Text style={styles.toolbarButton} onPress={this.closeDatabase}>
          Close DB
        </Text>
        <Text style={styles.toolbarButton} onPress={this.deleteDatabase}>
          Delete DB
        </Text>
      </View>
      <ListView
        enableEmptySections={true}
        dataSource={this.state.ds.cloneWithRows(this.state.progress)}
        renderRow={this.renderProgressEntry}
        style={listStyles.liContainer}/>
    </View>);
  }
}


var listStyles = StyleSheet.create({
  li: {
    borderBottomColor: '#c8c7cc',
    borderBottomWidth: 0.5,
    paddingTop: 15,
    paddingRight: 15,
    paddingBottom: 15,
  },
  liContainer: {
    backgroundColor: '#fff',
    flex: 1,
    paddingLeft: 15,
  },
  liIndent: {
    flex: 1,
  },
  liText: {
    color: '#333',
    fontSize: 17,
    fontWeight: '400',
    marginBottom: -3.5,
    marginTop: -3.5,
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  toolbar: {
    backgroundColor: '#51c04d',
    paddingTop: 30,
    paddingBottom: 10,
    flexDirection: 'row'
  },
  toolbarButton: {
    color: 'blue',
    textAlign: 'center',
    flex: 1
  },
  mainContainer: {
    flex: 1
  }
});
