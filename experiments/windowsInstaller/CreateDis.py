import os
import sys
import shutil
import js2c

def GetSourceFiles(webinos_root):
  jsFiles = []
  jsonFiles = []
  packageFiles = []
  nodeFiles = []
  nodeModuleDirs = []
  for root, dirs, files in os.walk(webinos_root):
    if not 'node_modules' in root.lower() and not "wrt" in root.lower() and not "test" in root.lower() and not "vb-sim" in root.lower():
      for f in files:
        if f.endswith(".js"):
          jsFiles.append(os.path.realpath(os.path.join(root,f)))
        # elif f.lower() == "package.json":
        #  jsFiles.append(os.path.realpath(os.path.join(root,f)))
        elif f.endswith(".json"):
          jsFiles.append(os.path.realpath(os.path.join(root,f)))
        elif f.endswith(".node"):
          nodeFiles.append(os.path.realpath(os.path.join(root,f))[len(webinos_root):])
      for d in dirs:
        if d.lower() == 'node_modules':
          nodeModuleDirs.append(os.path.realpath(os.path.join(root,d))[len(webinos_root):])
  return [jsFiles, jsonFiles, packageFiles, nodeFiles, nodeModuleDirs]

def CopyBinAndModules(nodeFiles,nodeModuleDirs,webinos_root,destination):
    # Clear previous contents
    shutil.rmtree(destination, True)
    os.makedirs(destination+'/node_modules')
    os.makedirs(destination+'/bin')
    for modDir in nodeModuleDirs:
      modulesRootDir = webinos_root+modDir
      for nMod in os.listdir(modulesRootDir):
        if os.path.isdir(os.path.join(modulesRootDir,nMod)):
          shutil.copytree(os.path.join(modulesRootDir,nMod),os.path.join(destination,'node_modules',nMod))
        else:
          shutil.copy(os.path.join(modulesRootDir,nMod),os.path.join(destination,'node_modules'))
    for nFile in nodeFiles:
      shutil.copy(webinos_root+'/'+nFile, destination +'/bin')
  
def main():
  webinos_root = os.path.realpath(os.path.join(os.path.dirname(__file__),"../../webinos"))
  destinationDir = os.path.realpath(os.path.join(os.path.dirname(__file__),"WebinosDist"))
  source_files = GetSourceFiles(webinos_root)
  CopyBinAndModules(source_files[3],source_files[4],webinos_root,destinationDir)
  
  # print source_files
  js2c.JS2C(source_files[0],webinos_root, source_files[3], ["WebinosDist\webinos_natives.h"])

if __name__ == "__main__":
  main()