---
layout: software
category: software

title: Routine
subtitle: Calendar focused Pebble watch face
date: 2014-12-19

tags:
  - android
  - pebble
  - java
  - c/c++

thumbnail: /img/routine/thumb.png

hero:
  foreground: /img/routine/hero.png
  background: /img/pebble-frame.png
  class: pebble
---
It's often joked about how nowadays smartphones are used for just about everything *except actual phone calls*.
A similar notion applies to smartwatches, where all the innovation seems directed towards additional features and not *timekeeping itself*.

Routine is the latest of my attempts to take advantage of the capabilities of smartwatches to give a more comprehensive sense of time than what regular clocks are capable of.
It does this by contextualising the current time within your agenda and daily routine.

Routine is available as a Pebble app and companion Android app.
[The latest version of both](https://github.com/edpenz/routine/releases/latest) can be downloaded from the [project's GitHub page](https://github.com/edpenz/routine).
The companion app is needed to sync calendar data to the watch face, but can also be used to change calendar priorities and create daily routines.

Like the similar [Solar watch face](./solar), it is visually structured around a circular 24-hour analogue dial representing the current day, starting with midnight at the bottom and progressing though morning on the left, midday on top and afternoon on the right.
The central dial indicates the current time in both digital and analogue fashion.
Surrounding this is shading indicating the durations of dawn, daylight, dusk and night.
Lastly, the day's agenda is drawn as blocks showing event start time, duration and importance.
