function realpath() {
	target_file=$1
	cd `dirname $target_file`
	target_file=`basename $target_file`

	# Iterate down a (possible) chain of symlinks
	while test -L "$target_file"
	do
		target_file=`readlink $target_file`
		cd `dirname $target_file`
		target_file=`basename $target_file`
	done
	echo $(pwd -P)/$target_file
}


