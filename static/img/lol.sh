#!/bin/bash
for ((i=1;i<=260;i++));
do
    convert slothpal.png -quality 100 -filter Lanczos -resize $i  scaled/slothpal_$i.png
    convert heymoon.png  -quality 100 -filter Lanczos -resize $i scaled/moonraser_$i.png
done
