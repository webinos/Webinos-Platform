#!/bin/bash
#
# This script along with "openssl.cnf" file from this folder creates
# a chain of three certificates containing RSA 1024 keys:
#	root (root) - root CA certificate (self signed).
#	2.rsa.cert (2.rsa.key) - second level CA certificate (signed with root/root)
#	cert3 (3.rsa.key) - signature/encryption certificate (signed with 2.rsa.key/2.rsa.cert)
# All the private keys are encrypted with password "secret".
#
export CA_TOP=./testCA
export CA_PWD=secret

CONFIG_FILE=../tools/openssl.cnf
SUBJECT_NAME=C=UK/ST=England/O=W3C/OU=Webapps

cd `dirname $0`/../keys

function gen_pkcs12 {
    name=`basename $1 .cert.pem`
    echo " $name"
    openssl pkcs12 -passin pass:$CA_PWD -passout pass:$CA_PWD -export -in $1 -inkey $name.key.pem -name $name $2 -out $name.p12
}

function verify {
    echo "* Test certificates"
    openssl verify -CAfile root.cert.pem 2.rsa.cert.pem
    for cert in `find . -name "*.cert.pem"`
    do
        openssl verify -CAfile root.cert.pem -untrusted 2.rsa.cert.pem $cert
    done
}

if [ $# -eq 0 ]
then
    echo "Usage:"
    echo "$0 new"
    echo "	Wipes all keys and certificates and starts again"
    echo "$0 add <name> <cert_title> <openssl_command>"
    echo "	creates a new key/cert called <name>, with the comment <cert_title>,"
    echo "	generated using <openssl_command>"
    echo "	Make sure the openssl_command produces a file called <name>.key.pem"
    exit;
fi

if [ "$1" = "new" ]
then
    echo "WARNING: THIS WILL WIPE ALL EXISTING KEYS AND CERTIFICATES!"
    read -p "Do you wish to continue? (y/[n]) " yn
    if [ "$yn" == "y" ]
    then
        echo "REALLY?! ALL WIDGETS SIGNED USING THESE KEYS AND CERTS WILL NEED TO BE RESIGNED!"
        read -p "I have made backups of these files and/or know what I'm doing. (y/[n]) " yn
        if [ "$yn" == "y" ]
        then
            echo "Continuing..."
        else
            exit
        fi
    else
        exit
    fi

    echo "* Remove old files"
    rm -rf "$CA_TOP" *.pem *.der *.p12 *.req *.crl

    echo "* Create CA folders structure"
    mkdir "$CA_TOP"
    mkdir "${CA_TOP}/certs"
    mkdir "${CA_TOP}/crl"
    mkdir "${CA_TOP}/newcerts"
    mkdir "${CA_TOP}/private"
    echo "01" > "$CA_TOP/serial"
    touch "$CA_TOP/index.txt"

    echo "* Create root key and certificate"
    export CERT_NAME="w3c-widgets-digsig-testsuite root certificate"
    openssl genrsa -out root.key.pem 2048
    openssl req -config $CONFIG_FILE -batch -new -x509 -days 7300 -key root.key.pem -out root.cert.pem -subj /CN=root/$SUBJECT_NAME
    gen_pkcs12 root.cert.pem

    echo "* Generate RSA key and second level certificate"
    export CERT_NAME="w3c-widgets-digsig-testsuite second level certificate"
    openssl genrsa -out 2.rsa.key.pem 2048
    openssl req -config $CONFIG_FILE -batch -new -key 2.rsa.key.pem -out 2.rsa.req -subj /CN=2.rsa/$SUBJECT_NAME
    openssl ca  -config $CONFIG_FILE -passin pass:$CA_PWD -batch -extensions v3_ca -cert root.cert.pem -keyfile root.key.pem -out 2.rsa.cert.pem -infiles 2.rsa.req
    gen_pkcs12 2.rsa.cert.pem
    
    echo "* Generate CA file with root and second level certificate"
    cp 2.rsa.cert.pem ca.cert.pem
    cat root.cert.pem >> ca.cert.pem

    echo "* Generate another RSA key and third level certificate"
    export CERT_NAME="w3c-widgets-digsig-testsuite sig and encryption certificate"
    openssl genrsa -out 3.rsa.key.pem 2048
    openssl req -config $CONFIG_FILE -batch -new -key 3.rsa.key.pem -out 3.rsa.req -subj /CN=3.rsa/$SUBJECT_NAME
    openssl ca  -config $CONFIG_FILE -passin pass:$CA_PWD -batch -cert 2.rsa.cert.pem -keyfile 2.rsa.key.pem -out 3.rsa.cert.pem -infiles 3.rsa.req
    gen_pkcs12 3.rsa.cert.pem "-certfile ca.cert.pem -caname 2.rsa -caname root.rsa"

    echo "* Generate another RSA key and third level certificate (revoked for 13a)"
    export CERT_NAME="w3c-widgets-digsig-testsuite sig and encryption certificate"
    openssl genrsa -out revoked.13a.rsa.key.pem 2048
    openssl req -config $CONFIG_FILE -batch -new -key revoked.13a.rsa.key.pem -out revoked.13a.rsa.req -subj /CN=revoked.13a.rsa/$SUBJECT_NAME
    openssl ca  -config $CONFIG_FILE -passin pass:$CA_PWD -batch -cert 2.rsa.cert.pem -keyfile 2.rsa.key.pem -out revoked.13a.rsa.cert.pem -infiles revoked.13a.rsa.req
    gen_pkcs12 revoked.13a.rsa.cert.pem "-certfile ca.cert.pem -caname 2.rsa -caname root.rsa"

    echo "* Generate another RSA key and third level certificate (revoked for 13b)"
    export CERT_NAME="w3c-widgets-digsig-testsuite sig and encryption certificate"
    openssl genrsa -out revoked.13b.rsa.key.pem 2048
    openssl req -config $CONFIG_FILE -batch -new -key revoked.13b.rsa.key.pem -out revoked.13b.rsa.req -subj /CN=revoked.13b.rsa/$SUBJECT_NAME
    openssl ca  -config $CONFIG_FILE -passin pass:$CA_PWD -batch -cert 2.rsa.cert.pem -keyfile 2.rsa.key.pem -out revoked.13b.rsa.cert.pem -infiles revoked.13b.rsa.req
    gen_pkcs12 revoked.13b.rsa.cert.pem "-certfile ca.cert.pem -caname 2.rsa -caname root.rsa"

    verify
    
    echo "* Generate CRLs"
    echo "01" > "$CA_TOP/crlnumber"
    openssl ca -gencrl -crldays 7300 -cert root.cert.pem -keyfile root.key.pem -out "$CA_TOP/crl/root.crl"
    openssl ca -revoke revoked.13a.rsa.cert.pem -cert 2.rsa.cert.pem -keyfile 2.rsa.key.pem
    openssl ca -gencrl -crldays 7300 -cert 2.rsa.cert.pem -keyfile 2.rsa.key.pem -out "$CA_TOP/crl/2.rsa.crl"
    openssl ca -revoke revoked.13b.rsa.cert.pem -cert 2.rsa.cert.pem -keyfile 2.rsa.key.pem
    openssl ca -gencrl -crldays 7300 -cert 2.rsa.cert.pem -keyfile 2.rsa.key.pem -out "$CA_TOP/crl/revoked.13b.rsa.crl"

    echo "* Cleanup"
    rm *.req
    rm ca.cert.pem

    exit;
elif [ "$1" = "add" ]
then
    name=$2
    cert_title=$3
    openssl_command=$4

    if [ "$openssl_command" != *$name.key.pem* ]
    then
        echo "Warning: openssl_command does not contain '$name.key.pem'"
        read -p "Do you wish to continue? [n] " yn
        if [ "$yn" == "y" ]
        then
            echo "Continuing..."
        else
            exit
        fi
    fi

    export CERT_NAME="w3c-widgets-digsig-testsuite $cert_title"
    eval "$openssl_command"
    openssl req -config $CONFIG_FILE -batch -new -key $name.key.pem -out $name.req
    openssl ca  -config $CONFIG_FILE -passin pass:$CA_PWD -batch -cert 2.rsa.cert.pem -keyfile 2.rsa.key.pem -out $name.cert.pem -infiles $name.req

    pkcs12
    verify

    echo "* Cleanup"
    rm *.req
else
    echo "Invalid command"
    exit;
fi
