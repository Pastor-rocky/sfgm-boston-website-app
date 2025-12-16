#!/bin/bash
# Script to sync audio files from course folders to public/uploads

echo "🎵 Syncing Course Audio Files..."

# Fire Starter (Course 2) - Chapters 1-10
echo "📁 Syncing Fire Starter audio files..."
for i in {1..10}; do
  if [ -f "SFGM Orlando Courses/(3) fire starter 🔥Course/Mp3/$i/ Fire Starter 🔥 Cp$i.mp3" ]; then
    cp "SFGM Orlando Courses/(3) fire starter 🔥Course/Mp3/$i/ Fire Starter 🔥 Cp$i.mp3" "public/uploads/firestarter-audio/fire-starter-cp$i.mp3"
    echo "  ✓ Copied Chapter $i"
  elif [ -f "SFGM Orlando Courses/(3) fire starter 🔥Course/Mp3/$i/Fire Starter 🔥 Cp$i.mp3" ]; then
    cp "SFGM Orlando Courses/(3) fire starter 🔥Course/Mp3/$i/Fire Starter 🔥 Cp$i.mp3" "public/uploads/firestarter-audio/fire-starter-cp$i.mp3"
    echo "  ✓ Copied Chapter $i"
  fi
done

# Don't be a Jonah (Course 3) - Chapters 1-11
echo "📁 Syncing Don't be a Jonah audio files..."
for i in {1..11}; do
  if [ -f "SFGM Orlando Courses/(2) Dont be a Jonah 🐋 Course/Mp3/$i/Don't be a Jonah CP$i.mp3" ]; then
    cp "SFGM Orlando Courses/(2) Dont be a Jonah 🐋 Course/Mp3/$i/Don't be a Jonah CP$i.mp3" "public/uploads/jonah-audio/dont-be-a-jonah-ch$i.mp3"
    echo "  ✓ Copied Chapter $i"
  fi
done

# G.R.O.W (Course 4) - Chapters 1-4
echo "📁 Syncing G.R.O.W audio files..."
for i in {1..4}; do
  if [ -f "SFGM Orlando Courses/(4) G.R.O.W 🌱Course /MP3s/G.R.O.W 🌱 Cp$i .mp3" ]; then
    cp "SFGM Orlando Courses/(4) G.R.O.W 🌱Course /MP3s/G.R.O.W 🌱 Cp$i .mp3" "public/uploads/grow-audio/grow-cp$i.mp3"
    echo "  ✓ Copied Chapter $i"
  elif [ -f "SFGM Orlando Courses/(4) G.R.O.W 🌱Course /MP3s/G.R.O.W 🌱 Cp$i.mp3" ]; then
    cp "SFGM Orlando Courses/(4) G.R.O.W 🌱Course /MP3s/G.R.O.W 🌱 Cp$i.mp3" "public/uploads/grow-audio/grow-cp$i.mp3"
    echo "  ✓ Copied Chapter $i"
  fi
done

# Studying for Service (Course 5) - Chapters 1-12
echo "📁 Syncing Studying for Service audio files..."
for i in {1..12}; do
  if [ -f "SFGM Orlando Courses/(5) Studying for Service 📚Course/Mp3s/$i/Studying for Service Cp$i.mp3" ]; then
    cp "SFGM Orlando Courses/(5) Studying for Service 📚Course/Mp3s/$i/Studying for Service Cp$i.mp3" "public/uploads/studying-audio/studying-for-service-cp$i.mp3"
    echo "  ✓ Copied Chapter $i"
  elif [ -f "SFGM Orlando Courses/(5) Studying for Service 📚Course/Mp3s/$i/Studying for Service Cp$i .mp3" ]; then
    cp "SFGM Orlando Courses/(5) Studying for Service 📚Course/Mp3s/$i/Studying for Service Cp$i .mp3" "public/uploads/studying-audio/studying-for-service-cp$i.mp3"
    echo "  ✓ Copied Chapter $i"
  fi
done

# Youth Ministry (Boston) - Sections 1-5
echo "📁 Syncing Youth Ministry audio files..."
for i in {1..5}; do
  if [ -f "SFGM Boston Courses/(2) Youth Ministry Course./Mp3s/$i/Section $i.mp3" ]; then
    cp "SFGM Boston Courses/(2) Youth Ministry Course./Mp3s/$i/Section $i.mp3" "public/uploads/youth-ministry-audio/youth-ministry-section-$i.mp3"
    echo "  ✓ Copied Section $i"
  elif [ -f "SFGM Boston Courses/(2) Youth Ministry Course./Mp3s/$i/Section $i .mp3" ]; then
    cp "SFGM Boston Courses/(2) Youth Ministry Course./Mp3s/$i/Section $i .mp3" "public/uploads/youth-ministry-audio/youth-ministry-section-$i.mp3"
    echo "  ✓ Copied Section $i"
  fi
done

# Deaconship (Boston) - Chapters 1-5
echo "📁 Syncing Deaconship audio files..."
for i in {1..5}; do
  if [ -f "SFGM Boston Courses/DEACONSHIP COURSE /Mp3s/$i/Cp$i.mp3" ]; then
    cp "SFGM Boston Courses/DEACONSHIP COURSE /Mp3s/$i/Cp$i.mp3" "public/uploads/deaconship-audio/deaconship-cp$i.mp3"
    echo "  ✓ Copied Chapter $i"
  elif [ -f "SFGM Boston Courses/(1) DEACONSHIP COURSE /Mp3s/$i/Cp$i.mp3" ]; then
    cp "SFGM Boston Courses/(1) DEACONSHIP COURSE /Mp3s/$i/Cp$i.mp3" "public/uploads/deaconship-audio/deaconship-cp$i.mp3"
    echo "  ✓ Copied Chapter $i"
  fi
done

echo "✅ Audio file sync complete!"




























