# Pixetor CLI

Wraps the Pixetor pixel editing application to enable similar export options via the command line.

## Installation

Option 1: Globally install Pixetor
```
npm install -g https://github.com/kdu-platforms/pixetor/tarball/main
```

Option 2: Clone and install Pixetor normally and then run npm link inside the installation root

## Usage

**Export provided .pixetor file as a png sprite sheet using app defaults**
```
pixetor-cli snow-monster.pixetor
```

**Export scaled sprite sheet**
```
pixetor-cli snow-monster.pixetor --scale 5
```

**Export scaled to specific (single frame) width value**
```
pixetor-cli snow-monster.pixetor --scaledWidth 435
```

**Export scaled to specific (single frame) height value**
```
pixetor-cli snow-monster.pixetor --scaledHeight 435
```

**Export sprite sheet as a single column**
```
pixetor-cli snow-monster.pixetor --columns 1
```

**Export sprite sheet as a single row**
```
pixetor-cli snow-monster.pixetor --rows 1
```

**Export a single frame (0 is first frame)**
```
pixetor-cli snow-monster.pixetor --frame 3
```

**Export a second file containing the data-uri for the exported png**
```
pixetor-cli snow-monster.pixetor --dataUri
```

**Export cropped**
```
pixetor-cli snow-monster.pixetor --crop
```

**Custom output path and/or filename**
```
pixetor-cli snow-monster.pixetor --dest ./output-folder/snah-monstah.png
```