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

//Create a New Job
const titleCreate = new QLabel();
titleCreate.setObjectName("title");
titleCreate.setText("Create A Job");

const labelPO1 = new QLabel();
labelPO1.setObjectName("label");
labelPO1.setText("PO #: ");

const textBoxPO1 = new QLineEdit();

const labelStore1 = new QLabel();
labelStore1.setObjectName("label");
labelStore1.setText("Store #: ");

const textBoxStore1 = new QLineEdit();

const labelDate = new QLabel();
labelDate.setObjectName("label");
labelDate.setText("Date: ");

const dateSelector = new QDateEdit();

const labelBilled = new QLabel();
labelBilled.setObjectName("label");
labelBilled.setText("Amount Billed: ");

const textBoxBilled = new QLineEdit();

const buttonCreate = new QPushButton();
buttonCreate.setText('Submit');
buttonCreate.addEventListener('clicked', async () => {

    let validPO = false;
    let inputPO = textBoxPO1.displayText();

    if(validPO)
    {
      displayJobAdd.setText(textBoxPO1.text() + "\n" + dateSelector.date().toString(1)
      + "\n$" + textBox2.text());
    }
    else{
      const allJobs = await prisma.Job.findMany()

      let tempText = "";
      for(let x = 0; x < allJobs.length; x++)
      {
        tempText = tempText + "Store #: " + allJobs[x].Store + "\n"

        tempText = tempText + "PO: " + allJobs[x].PO + "\n"

        let dateString = allJobs[x].billDate.toISOString().slice(0, 10);
        dateString = dateString.slice(5, 7) + "/" + dateString.slice(8, 10) + "/"  + dateString.slice(0, 4)

        tempText = tempText + "Date: " + dateString + "\n"

        let tempBilled = allJobs[x].amountBilled.toString()
        tempBilled = tempBilled.slice(0, tempBilled.length-2) + "." + tempBilled.slice(tempBilled.length-2)
        tempText = tempText + "Amount Billed: $" + tempBilled + "\n"

        if(allJobs[x].amountPaid == null)
        {tempText = tempText + "Amount Paid: N/A" + "\n\n"}
        else
        {
          let tempPaid = allJobs[x].amountPaid.toString();
          tempPaid = tempPaid.slice(0, tempPaid.length-2) + "." + tempPaid.slice(tempPaid.length-2)
          tempText = tempText + "Amount Paid: $" + tempPaid + "\n\n"
        }
      }
      displayJobAdd.setText(tempText);
    }
});


//Add Pay to existing job
const titleAdd = new QLabel();
titleAdd.setObjectName("title");
titleAdd.setText("Add Pay to Job");

const labelPO2 = new QLabel();
labelPO2.setObjectName("label");
labelPO2.setText("PO #: ");

const textBoxPO2 = new QLineEdit();

const labelStore2 = new QLabel();
labelStore2.setObjectName("label");
labelStore2.setText("Store #: ");

const textBoxStore2 = new QLineEdit();

const labelPaid = new QLabel();
labelPaid.setObjectName("label");
labelPaid.setText("Amount Paid: ");

const textBoxPaid = new QLineEdit();

const buttonAdd = new QPushButton();
buttonAdd.setText('Submit');
buttonAdd.addEventListener('clicked', async () => {
  return;
});

const displayJobAdd = new QTextBrowser();
displayJobAdd.setReadOnly(true);


//Find an existing job to display it
const titleFind = new QLabel();
titleFind.setObjectName("title");
titleFind.setText("Find Job");

const labelPO3 = new QLabel();
labelPO3.setObjectName("label");
labelPO3.setText("PO #: ");

const textBoxPO3 = new QLineEdit();

const labelStore3 = new QLabel();
labelStore3.setObjectName("label");
labelStore3.setText("Store #: ");

const textBoxStore3 = new QLineEdit();

const buttonFind = new QPushButton();
buttonFind.setText('Submit');
buttonFind.addEventListener('clicked', async () => {
  return;
});

const displayJobFind = new QTextBrowser();
displayJobFind.setReadOnly(true);

//----------------------------------

rootLayout.addWidget(titleCreate);

rootLayout.addWidget(labelPO1);
rootLayout.addWidget(textBoxPO1);

rootLayout.addWidget(labelStore1);
rootLayout.addWidget(textBoxStore1);

rootLayout.addWidget(labelDate);
rootLayout.addWidget(dateSelector);

rootLayout.addWidget(labelBilled);
rootLayout.addWidget(textBoxBilled);

rootLayout.addWidget(buttonCreate);


rootLayout.addWidget(titleAdd);

rootLayout.addWidget(labelPO2);
rootLayout.addWidget(textBoxPO2);

rootLayout.addWidget(labelStore2);
rootLayout.addWidget(textBoxStore2);

rootLayout.addWidget(labelPaid);
rootLayout.addWidget(textBoxPaid);

rootLayout.addWidget(buttonAdd);

rootLayout.addWidget(displayJobAdd);


rootLayout.addWidget(titleFind);

rootLayout.addWidget(labelPO3);
rootLayout.addWidget(textBoxPO3);

rootLayout.addWidget(labelStore3);
rootLayout.addWidget(textBoxStore3);

rootLayout.addWidget(buttonFind);

rootLayout.addWidget(displayJobFind);


win.setCentralWidget(centralWidget);
win.setStyleSheet(
  `
    #myroot {
      background-color: #F24F0F;
      height: '100%';
      align-items: 'center';
      justify-content: 'center';
    }
    #title {
      font-size: 18px;
      font-weight: bold;
      padding: 1;
    }
    #label {
      font-size: 12px;
      padding: 1;
    }
  `
);
win.show();

(global).win = win;
