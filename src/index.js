import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QLineEdit, 
  QDateEdit, QTextBrowser } from '@nodegui/nodegui';
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const prompt = require("prompt-sync")();


const win = new QMainWindow();
win.setWindowTitle("Service Plus Job Database");

const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);

const title1 = new QLabel();
title1.setObjectName("title1");
title1.setText("Create A Job");

const label2 = new QLabel();
label2.setObjectName("label1");
label2.setText("PO #: ");

const dateSelector = new QDateEdit();

const label3 = new QLabel();
label3.setObjectName("label1");
label3.setText("Date: ");

const label4 = new QLabel();
label4.setObjectName("label1");
label4.setText("Dollar Amount: ");

const textBox1 = new QLineEdit();
const textBox2 = new QLineEdit();

const displayJob = new QTextBrowser();
displayJob.setReadOnly(true);

const button1 = new QPushButton();
button1.setText('Submit');
button1.addEventListener('clicked', async () => {
    if(textBox1.displayText() === "56709")
    {
      console.log("You got it");
      displayJob.setText(textBox1.text() + "\n" + dateSelector.date().toString(1)
      + "\n $" + textBox2.text());
      
    }
    else{
      console.log("Nuh Uh \n")
      const allJobs = await prisma.Job.findMany()
      console.log(allJobs);
      console.log("\n");

      let tempText = "";
      for(let x = 0; x < allJobs.length; x++)
      {
        for(let y in allJobs[x])
        {
          tempText = tempText  + y + ": " + allJobs[x][y] + "\n"
        }
        tempText = tempText + "\n"
      }
      displayJob.setText(tempText);
    }
});

rootLayout.addWidget(title1); //Create a Job

rootLayout.addWidget(label2); //PO
rootLayout.addWidget(textBox1);

rootLayout.addWidget(label3); //Dollar Amount
rootLayout.addWidget(dateSelector); //Date

rootLayout.addWidget(label4); //Dollar Amount
rootLayout.addWidget(textBox2);

rootLayout.addWidget(button1); //Submit Create

rootLayout.addWidget(displayJob);


win.setCentralWidget(centralWidget);
win.setStyleSheet(
  `
    #myroot {
      background-color: #F24F0F;
      height: '100%';
      align-items: 'center';
      justify-content: 'center';
    }
    #title1 {
      font-size: 18px;
      font-weight: bold;
      padding: 1;
    }
    #label1 {
      font-size: 12px;
      padding: 1;
    }
  `
);
win.show();

(global).win = win;
