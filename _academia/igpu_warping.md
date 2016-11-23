---
layout: paper
category: academia
permalink: /academia/:title

title: Using Integrated GPUs to Perform Image Warping for HMDs
source: Image and Vision Computing New Zealand
source-abbv: IVCNZ
date: 2014-11-19
authors:
  - Edward Peek
  - Burkhard Wünsche
  - Christof Lutteroth
---
In virtual reality applications, frame rate and latency are critical performance metrics for maintaining a comfortable user experience and avoiding simulator-sickness.
Various methods may be used to improve frame rate and latency, however they often come at the cost of image quality or other performance metrics.

One particularly beneficial method is synthesising additional and/or lower-latency frames using image warping.
However, desktop graphics subsystems lack the required level of parallelism to effectively implement a complete image warping solution on computers with a single GPU.
Fortunately many computers that are treated as single-GPU systems are, in fact, multi-GPU due to the presence of a low-performance secondary GPU integrated with the CPU package.

In this paper we describe an image warping system which exploits the hardware parallelism offered by integrated GPUs to avoid the aforementioned graphics subsystem limitations.
This system improves both perceived frame rate and latency: in contrast to alternative systems which only improve one or the other.

We also evaluate the performance of performing image warping on integrated GPUs.
Our system is able to perform a warp in as little as 4.2ms at 1920x1080 resolution on an Intel HD Graphics 2000 IGP at the cost of a 1.5ms increase in application render time.
This demonstrates that the overhead of our system is manageable for current VR applications even on several year old computer hardware.
