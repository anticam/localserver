# Load test for cloud connector

## Start local server

[How do you set up a local testing server?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/set_up_a_local_testing_server)

Step 1.
Create a new folder and download the repository from GitHub.

Step 2.
Open the terminal, navigate to the folder and run the following command to start the server:
`node server.js`

Step 3.
Verfiy the server is running by opening a web browser and navigating to [http://localhost:3000](http://localhost:3000)

Step 4.
Download some PDF files from the help page for data transfer:
https://help.sap.com/docs/CP_CONNECTIVITY - *Download PDF* link  
https://help.sap.com/btp - *Download PDF* link  


from curl
`curl -v http://localhost:3000`

from VSCode try HTTP GET and POST methods from requests.http

Step 5.
Try to fetch the PDF from browser:
http://localhost:3000/pdf_file_name.pdf
