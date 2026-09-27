#!/usr/bin/env bash
# sheets.sh <dir> <prefix> — tile the PNGs in <dir> into 6-up contact sheets.
dir=$1; pre=${2:-sheet}
files=($dir/f*.png); n=${#files[@]}; s=0; k=0
while [ $s -lt $n ]; do
  chunk=("${files[@]:$s:6}"); args=(); filt=""; i=0
  for c in "${chunk[@]}"; do args+=(-i "$c"); filt+="[$i:v]scale=360:640,pad=w=366:h=640:x=0:y=0:color=yellow[v$i];"; i=$((i+1)); done
  ins=""; for j in $(seq 0 $((i-1))); do ins+="[v$j]"; done
  ffmpeg -hide_banner -loglevel error -y "${args[@]}" -filter_complex "${filt}${ins}hstack=inputs=$i" "$dir/../$pre$k.png"
  echo "$pre$k: $(for c in "${chunk[@]}"; do basename $c .png; done | tr '\n' ' ')"
  k=$((k+1)); s=$((s+6))
done
