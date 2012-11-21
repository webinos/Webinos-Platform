#!/bin/sh

. $(dirname $0)/realpath.sh

if [ $# -lt 2 ]
then
	echo "Usage: $0 assertionID testName [-u]"
	echo "  -u  update signatures"
	exit
fi

ID=w3c-testsuite-id
ID=$ID-$1-$2

toolsdir=$(dirname $(realpath $0))
suitedir=`dirname $PWD`

casedir="$suitedir/test-cases"
testdir="$casedir/$1/$2"
echo $toolsdir

if [ ! -d "$testdir" ]
then
	echo "Error: No directory $testdir"
	exit
fi

echo "* Removing widget..."
cd $testdir
rm $2.wgt

if [ "$3" = "-u" ]
then
    echo "* Updating widget signatures..."
    for i in $(find . -iname "author-signature.xml")
    do
        $toolsdir/sign-widget.sh --untrusted-pem "$suitedir/keys/2.rsa.cert.pem" --trusted-pem "$suitedir/keys/root.cert.pem" --pkcs12 "$suitedir/keys/3.rsa.p12" --pwd secret -x -u -a -o $i $testdir
    done
    for i in $(find . -iname 'signature*.xml')
    do
        $toolsdir/sign-widget.sh --untrusted-pem "$suitedir/keys/2.rsa.cert.pem" --trusted-pem "$suitedir/keys/root.cert.pem" --pkcs12 "$suitedir/keys/3.rsa.p12" --pwd secret -x -u -o $i $testdir
    done
    echo
fi

echo -n "* Validating... "
validatecmd="$toolsdir/validate-widget.sh --untrusted-pem $suitedir/keys/2.rsa.cert.pem --trusted-pem $suitedir/keys/root.cert.pem --pkcs12 $suitedir/keys/3.rsa.p12 --pwd secret $testdir"

sh -x $validatecmd

if [ "$?" -ne 0 ]
then
    echo "FAILED with command:"
    echo "$validatecmd"
    echo
else
    echo "SUCCESS with command:"
    echo "$validatecmd"
    echo
fi

echo "* Zipping widget..."
zip -r $2.wgt `ls | grep -v CVS`
cd -
echo

echo "Done."
