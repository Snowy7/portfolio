---
title: "How We Got 2nd Place at Shell Eco-Marathon"
excerpt: "The story of building an autonomous vehicle from scratch — LiDAR integration, sensor fusion, and what went wrong (and right) during competition day."
date: "Jul 2025"
readTime: "8 min"
tags: ["Autonomous", "Engineering"]
published: true
---

## The Challenge

Shell Eco-Marathon's Autonomous Urban Concept category isn't your typical robotics competition. You're building a real vehicle that needs to navigate a course autonomously — lane following, obstacle avoidance, parking, and all of it under time pressure with judges watching.

Our team at UDST had been working on the vehicle since November 2024. I led the autonomous systems team, and this is the story of how we went from "we have a car" to "we got 2nd place in Poland."

## The Stack

We ran everything on an NVIDIA JETSON AGX — enough compute for real-time processing without the weight of a full PC. The software stack:

- **ROS2** for inter-process communication and sensor orchestration
- **Python** for high-level planning and decision making
- **C++** for performance-critical perception code
- **LiDAR** (primary) + **ultrasonic sensors** (close-range) for perception
- **Computer vision** for lane detection as a secondary system

## The Hard Parts

**Sensor fusion was the real challenge.** LiDAR gives you great point clouds, but parsing them in real-time on embedded hardware while also processing ultrasonic returns and camera feeds requires careful optimization. We spent weeks tuning the fusion pipeline.

**Autonomous parking** was another beast. ±5cm accuracy sounds reasonable until you realize the course has tight constraints and you get one shot. We implemented a multi-phase approach: coarse positioning via LiDAR mapping, then fine adjustment using ultrasonic sensors for the final approach.

## Competition Day

Poland, July 2025. The nerves were real. Our first autonomous run had a hiccup — a false positive on obstacle detection caused an unnecessary stop. We fixed the threshold between runs and the second attempt was clean.

The parking challenge went nearly perfectly. The vehicle slotted into the space with precision that impressed even the judges.

## What I Learned

1. **Test in conditions as close to competition as possible.** Our garage testing didn't account for the reflective surfaces on the competition course.
2. **Have fallback behaviors.** When our primary lane detection struggled with lighting changes, the LiDAR-based fallback kept us on track.
3. **Sleep is not optional.** I debugged LiDAR data at 3 AM the night before competition. Don't do this.

2nd place against international teams. Not bad for a university team's first entry.
