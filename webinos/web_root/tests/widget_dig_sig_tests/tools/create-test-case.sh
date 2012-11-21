#!/bin/sh

. $(dirname $0)/realpath.sh

ID=w3c-testsuite-id

if [ $# -ne 2 ]
then
    echo "Usage: $0 assertionID testName"
    exit;
fi

ID=$ID-$1-$2

toolsdir=$(dirname $(realpath $0))
suitedir=`dirname $toolsdir`

casedir="$suitedir/test-cases"
testdir="$casedir/$1/$2"

echo "* Creating $casedir/$1 ..."
mkdir -p "$casedir/$1"

echo "* Copying template to $testdir ..."
cp -r "$casedir/template" "$testdir"

configxml="$testdir/config.xml"
echo "* Adding correct IDs to files..."
sed -i "s/TESTID/$2/g" $configxml
sed -i "s/ASSID/$1/g" $configxml

index="$testdir/index.html"
sed -i "s/TESTID/$2/g" $index
sed -i "s/ASSID/$1/g" $index

echo "* Generating signatures"
#author
$toolsdir/sign-widget.sh --pkcs12 "$suitedir/keys/3.rsa.p12" --pwd secret -x -a -i $ID-author -c "$suitedir/keys/3.rsa.cert.pem" -c "$suitedir/keys/2.rsa.cert.pem" $testdir
#with x509 cert
$toolsdir/sign-widget.sh --pkcs12 "$suitedir/keys/3.rsa.p12" --pwd secret -x -i $ID -c "$suitedir/keys/3.rsa.cert.pem" -c "$suitedir/keys/2.rsa.cert.pem" $testdir
$toolsdir/sign-widget.sh --pkcs12 "$suitedir/keys/3.rsa.p12" --pwd secret -i $ID-2 -o "signature2.xml" -c "$suitedir/keys/3.rsa.cert.pem" -c "$suitedir/keys/2.rsa.cert.pem" $testdir

echo "* Zipping widget..."
cd $testdir
zip $2.wgt *
cd -

echo "* Adding test to test-suite.xml..."
sed -i "s#</testsuite>#<test id=\"$2\" for=\"$1\" src=\"test-cases/$1/$2/$2.wgt\">\nDESCRIPTION\n</test>\n\n</testsuite>#" "$suitedir/test-suite.xml"

echo ""
echo "Done."
