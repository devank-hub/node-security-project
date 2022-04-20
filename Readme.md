
How to create OpenSSL certificates/Key in your system through cmd
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365

openssl -> to initialize openssl in your system
req -> to generate a certificate request
-x509 -> to generate a self-signed certificate
-newkey -> to generate a new key
rsa:4096 -> to generate a new key with strongest  algorithm and a key length of 4096 bits
-nodes -> to generate a new key without a passphrase/password
-keyout -> to save the key to a file
key.pem -> to save the key to a file called key.pem where pem is the extension
-out -> to save the certificate to a file
cert.pem -> to save the certificate to a file called cert.pem where pem is the extension
-days 365-> to set the validity of the certificate to 365 days
