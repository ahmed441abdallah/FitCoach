"use client";

import React, { useState } from "react";

export interface DeviceItem {
  name: string;
  category: string;
  role: string;
  settingTip: string;
}

export interface InstructionItem {
  title: string;
  detail: string;
  cue: string;
}

export interface ExerciseItem {
  name: string;
  device: string;
  sets: string;
  reps: string;
  rest: string;
  tempo: string;
  proTip: string;
}

export interface MuscleProtocol {
  id: string;
  name: string;
  subtitle: string;
  targetHeads: string[];
  biomechanicsOverview: string;
  devices: DeviceItem[];
  instructions: InstructionItem[];
  exercises: ExerciseItem[];
  weeklyFrequency: string;
  progressionRule: string;
}

export const MUSCLE_PROTOCOLS: Record<string, MuscleProtocol> = {
  chest: {
    id: "chest",
    name: "Chest (Pectorals)",
    subtitle: "Clavicular & Sternal Hypertrophy Protocol",
    targetHeads: [
      "Upper Clavicular Head",
      "Mid Sternal Pectoral",
      "Lower Costal Fibers",
      "Pectoralis Minor",
    ],
    biomechanicsOverview:
      "The pectoralis major functions to adduct, horizontally flex, and internally rotate the humerus. Lagging chest development is almost always caused by front-deltoid dominance and failing to achieve full active adduction under tension.",
    devices: [
      {
        name: "Incline Adjustable Bench (30°)",
        category: "Free Weights & Bench",
        role: "Upper Clavicular Fiber Alignment",
        settingTip:
          "Set angle strictly at 30° (not 45°). 45° shifts load to the anterior deltoids; 30° precisely aligns with the upper clavicular fibers.",
      },
      {
        name: "Dual Cable Pulley Station",
        category: "Cable Machine",
        role: "Continuous Tension & Full Cross-Body Adduction",
        settingTip:
          "Cross hands slightly past midline at peak contraction to reach maximum short-position muscle activation.",
      },
      {
        name: "Converging Chest Press Machine",
        category: "Plate-Loaded / Pin-Loaded",
        role: "Joint-Friendly Heavy Overload",
        settingTip:
          "Align handles with mid-sternum. Seat height should allow elbows to track comfortably at 45° below shoulder level.",
      },
      {
        name: "Pec Deck Fly Machine",
        category: "Isolation Machine",
        role: "Controlled Lengthened Stretch",
        settingTip:
          "Keep elbows soft (not locked). Do not allow handles to pull shoulders behind torso plane to preserve anterior joint capsules.",
      },
    ],
    instructions: [
      {
        title: "Scapular Retraction & Depression",
        detail:
          "Before pressing, pull shoulder blades together and pin them down into your back pockets. Keep your chest proud throughout the entire rep.",
        cue: "Puff chest out, pin shoulders back and down.",
      },
      {
        title: "The 2-Second Lengthened Stretch",
        detail:
          "Pause for 2 full seconds at the deepest comfortable stretch on every repetition to trigger stretch-mediated hypertrophy.",
        cue: "Feel pecs pull wide open under control.",
      },
      {
        title: "Drive Biceps Inward, Not Hands Out",
        detail:
          "Think about squeezing the insides of your upper arms into the sides of your ribcage, rather than pushing dumbbells together.",
        cue: "Touch biceps to your pecs at the top.",
      },
      {
        title: "3-Second Controlled Negative",
        detail:
          "Never let weights freefall. Resist on the way down for 3 seconds to generate maximum mechanical tension.",
        cue: "Lower like a slow hydraulic piston.",
      },
    ],
    exercises: [
      {
        name: "30° Incline Dumbbell Press",
        device: "Incline Bench + Dumbbells",
        sets: "4 Sets",
        reps: "8 - 10 Reps",
        rest: "90s",
        tempo: "3-1-1-0",
        proTip: "Turn thumbs slightly outward at bottom to relieve rotator cuffs.",
      },
      {
        name: "Plate-Loaded Converging Press",
        device: "Chest Press Machine",
        sets: "3 Sets",
        reps: "10 - 12 Reps",
        rest: "75s",
        tempo: "3-0-1-1",
        proTip: "Perform a drop-set on set 3 to momentary muscular failure.",
      },
      {
        name: "Low-to-High Cable Crossover",
        device: "Dual Cable Station",
        sets: "3 Sets",
        reps: "12 - 15 Reps",
        rest: "60s",
        tempo: "2-0-1-2",
        proTip: "Pause for 2 seconds at eye level; squeeze inner chest hard.",
      },
      {
        name: "Deep Deficit Push-ups",
        device: "Push-up Bars / Elevated Plates",
        sets: "2 Sets",
        reps: "To Failure",
        rest: "60s",
        tempo: "Controlled",
        proTip: "Deep fascia stretch finisher; let chest sink below hand level.",
      },
    ],
    weeklyFrequency: "2x per week (48-72h recovery between sessions)",
    progressionRule:
      "When you can hit 10 reps on all 4 sets of incline press with strict tempo, increase dumbbell weight by 2 kg next session.",
  },

  back: {
    id: "back",
    name: "Back (Lats & Mid-Back)",
    subtitle: "V-Taper Width & Rhomboid Thickness Blueprint",
    targetHeads: [
      "Latissimus Dorsi (Upper & Lower)",
      "Rhomboids",
      "Middle & Lower Trapezius",
      "Teres Major & Erector Spinae",
    ],
    biomechanicsOverview:
      "The lats pull the upper arm down and back. A lagging back is almost universally caused by initiating the movement with biceps flexion rather than driving down through the elbows and depressing the scapula.",
    devices: [
      {
        name: "Lat Pulldown Station (Neutral / Mag-Grip)",
        category: "Cable Machine",
        role: "Vertical Plane Lat Fiber Recruitment",
        settingTip:
          "Thigh pad firmly clamped over legs. Use a shoulder-width neutral grip to line up directly with lower lat fiber angles.",
      },
      {
        name: "Chest-Supported T-Bar / Row Machine",
        category: "Plate-Loaded Machine",
        role: "Spine-Safe Rhomboid & Mid-Back Density",
        settingTip:
          "Adjust chest pad so upper chest rests just above pad edge. Eliminates lower-back shear stress completely.",
      },
      {
        name: "Seated Cable Row Station",
        category: "Cables & Pulley",
        role: "Horizontal Plane Lat & Trapezius Sweep",
        settingTip:
          "Maintain upright torso with slight 10° natural arch. Pull cable attachment directly to your belly button.",
      },
      {
        name: "45° Hyperextension Bench",
        category: "Bench Apparatus",
        role: "Spinal Erectors & Posterior Chain Stability",
        settingTip:
          "Upper pad set below hip crease so hips can hinge freely without rounding the lumbar spine.",
      },
    ],
    instructions: [
      {
        title: "Pull With Your Elbows",
        detail:
          "Imagine your hands are simply hooks. Direct 100% of your focus to driving your elbows down into your back pockets.",
        cue: "Lead with elbows; relax forearms.",
      },
      {
        title: "Scapular Protraction at Full Stretch",
        detail:
          "Allow your shoulder blades to spread wide open at the top of every repetition to fully lengthen the latissimus dorsi.",
        cue: "Let the lats flare out like wings.",
      },
      {
        title: "Keep Torso Angle Rigid",
        detail:
          "Avoid violently swinging your torso back and forth. A stable torso isolates back muscles and stops momentum.",
        cue: "Lock core; row with pure muscle.",
      },
      {
        title: "1-Second Isometric Squeeze",
        detail:
          "Hold the contracted position against your ribcage for a solid 1 second before beginning the slow return.",
        cue: "Pinch a coin between shoulder blades.",
      },
    ],
    exercises: [
      {
        name: "Neutral-Grip Lat Pulldown",
        device: "Lat Pulldown Machine",
        sets: "4 Sets",
        reps: "8 - 10 Reps",
        rest: "90s",
        tempo: "3-1-1-1",
        proTip: "Keep collarbone lifted; pull down to chin level.",
      },
      {
        name: "Chest-Supported Row",
        device: "T-Bar or Machine Row",
        sets: "4 Sets",
        reps: "10 - 12 Reps",
        rest: "90s",
        tempo: "3-0-1-1",
        proTip: "Flare elbows out at 45° to target mid-traps and rhomboids.",
      },
      {
        name: "Single-Arm High-to-Low Cable Row",
        device: "Cable Pulley + Single Handle",
        sets: "3 Sets",
        reps: "12 Reps / side",
        rest: "60s",
        tempo: "2-1-1-1",
        proTip: "Slight lateral torso lean increases lower lat engagement.",
      },
      {
        name: "Straight-Arm Rope Pullover",
        device: "High Cable + Rope",
        sets: "3 Sets",
        reps: "15 Reps",
        rest: "60s",
        tempo: "2-1-1-1",
        proTip: "Keep arms extended with soft elbow; sweep down to thighs.",
      },
    ],
    weeklyFrequency: "2x per week (Day A: Vertical Width, Day B: Horizontal Thickness)",
    progressionRule:
      "Prioritize mind-muscle connection. Only increase weight when you can pause for 1 second at full contraction without swinging.",
  },

  shoulders: {
    id: "shoulders",
    name: "Shoulders (Deltoids)",
    subtitle: "3D Capped Deltoids & Rotator Health Architecture",
    targetHeads: [
      "Lateral Deltoid (Side Cap)",
      "Posterior Deltoid (Rear Head)",
      "Anterior Deltoid (Front Head)",
      "Rotator Cuff Complex",
    ],
    biomechanicsOverview:
      "The side and rear delts create the visual V-taper. Lateral delts respond best to continuous tension across their arc. Trapezius muscles often take over when weights are too heavy or elbows drop below wrist line.",
    devices: [
      {
        name: "Dual Cable Pulley Station",
        category: "Cables",
        role: "Continuous Tension Throughout Full Abduction",
        settingTip:
          "Set pulleys at hand level or ankle level. Using wrist straps or cuffs eliminates forearm grip fatigue.",
      },
      {
        name: "Reverse Pec Deck Machine",
        category: "Fly Machine",
        role: "Strict Posterior Deltoid Hypertrophy",
        settingTip:
          "Seat adjusted so handles align with eye level. Keep wrists relaxed and lead with the rear elbows.",
      },
      {
        name: "Seated Smith Machine / Overhead Bench",
        category: "Smith Machine / Free Weights",
        role: "Heavy Anterior Deltoid & Clavicular Pressing",
        settingTip:
          "Set bench angle to 75°-80° (slight incline rather than 90° straight up) to open subacromial space.",
      },
      {
        name: "Incline Bench (45°)",
        category: "Adjustable Bench",
        role: "Prone Chest-Supported Rear Delt Swings",
        settingTip:
          "Lie face down on bench; sweep dumbbells outward at a 45° angle to bypass mid-trapezius.",
      },
    ],
    instructions: [
      {
        title: "Work in the Scapular Plane",
        detail:
          "Perform lateral raises approximately 30° forward of your sides rather than strictly lateral. This prevents rotator cuff pinching.",
        cue: "Raise arms slightly forward, like pouring a glass.",
      },
      {
        title: "Elbows Higher Than Wrists",
        detail:
          "Never let your hands rise higher than your elbows. Leading with the elbows guarantees lateral delt load.",
        cue: "Think of puppet strings pulling your elbows up.",
      },
      {
        title: "Depress Your Traps",
        detail:
          "Actively push your neck tall and shoulder blades down before initiating the raise so upper traps don't steal the work.",
        cue: "Long neck, relaxed traps.",
      },
      {
        title: "High Frequency Tolerance",
        detail:
          "Lateral and rear deltoid fibers are predominantly slow/intermediate twitch and recover within 48 hours.",
        cue: "Hit delts 2-3 times weekly with strict form.",
      },
    ],
    exercises: [
      {
        name: "Seated Dumbbell Shoulder Press",
        device: "75° Incline Bench + Dumbbells",
        sets: "4 Sets",
        reps: "8 - 10 Reps",
        rest: "90s",
        tempo: "3-0-1-0",
        proTip: "Lower dumbbells to ear level; do not clang them at the top.",
      },
      {
        name: "Behind-the-Back Cable Lateral Raise",
        device: "Cable Pulley + Wrist Cuff",
        sets: "4 Sets",
        reps: "12 - 15 Reps",
        rest: "60s",
        tempo: "2-1-1-1",
        proTip: "Continuous tension even at the bottom; pause 1s at top.",
      },
      {
        name: "Reverse Pec Deck Rear Flyes",
        device: "Rear Delt Machine",
        sets: "4 Sets",
        reps: "15 - 20 Reps",
        rest: "60s",
        tempo: "2-0-1-2",
        proTip: "2-second peak isometric hold on every single repetition.",
      },
      {
        name: "Cable Face Pulls with External Rotation",
        device: "High Cable Pulley + Rope",
        sets: "3 Sets",
        reps: "15 Reps",
        rest: "60s",
        tempo: "2-1-1-1",
        proTip: "Pull rope apart to forehead level; rotate thumbs backward.",
      },
    ],
    weeklyFrequency: "2 to 3 times per week",
    progressionRule:
      "Delts grow from micro-overload. Add 1-2 reps or improve isometric pause time before increasing dumbbell size.",
  },

  arms: {
    id: "arms",
    name: "Arms (Biceps & Triceps)",
    subtitle: "Peak Biceps & Horseshoe Triceps Protocol",
    targetHeads: [
      "Triceps Long Head (Overhead Mass)",
      "Triceps Lateral & Medial Heads",
      "Biceps Long Head (Peak)",
      "Brachialis (Arm Thickness)",
    ],
    biomechanicsOverview:
      "Triceps make up 60% of total arm circumference. The long head attaches to the infraglenoid tubercle of the scapula and only gets fully stretched when the arm is raised overhead. Biceps require both elbow flexion and outward wrist supination.",
    devices: [
      {
        name: "45° Incline Dumbbell Bench",
        category: "Free Weights & Bench",
        role: "Biceps Long Head Stretch Hypertrophy",
        settingTip:
          "Set bench to 45°-50°. Let arms hang straight down behind torso plane to maximize lengthened-state tension.",
      },
      {
        name: "Preacher / Scott Curl Bench",
        category: "Machine / Free Weights",
        role: "Short Head & Brachialis Strict Isolation",
        settingTip:
          "Armpit snug against the pad top. Stops all shoulder assistance dead in its tracks.",
      },
      {
        name: "Cable Pulley Station (Dual Rope / V-Bar)",
        category: "Cables",
        role: "Constant Tension Triceps Lockout",
        settingTip:
          "Use a dual-rope setup to allow a wider flare at bottom lockout for superior lateral head recruitment.",
      },
      {
        name: "Overhead Cable Extension Station",
        category: "Cables",
        role: "Triceps Long Head Deep Lengthening",
        settingTip:
          "Set pulley at chest or hip height. Lean forward 30° so elbows stay pointed forward and overhead.",
      },
    ],
    instructions: [
      {
        title: "Supinate Outward at Top of Curl",
        detail:
          "Turn your pinky finger hard toward the ceiling as you reach the top of dumbbell curls to ignite maximum biceps peak.",
        cue: "Twist pinky up and out.",
      },
      {
        title: "Lock Elbow Hinges in Place",
        detail:
          "Do not swing elbows forward during curls or backward during pushdowns. Only the forearms should move.",
        cue: "Elbows are nailed to your sides.",
      },
      {
        title: "Include Overhead Triceps Work",
        detail:
          "Pushdowns alone will not grow the long head. You must include overhead extensions to hit the largest triceps belly.",
        cue: "Deep stretch behind the neck.",
      },
      {
        title: "Full Lockout Squeeze",
        detail:
          "Lock arms straight on triceps extensions and contract intensely for 1 second before beginning the eccentric phase.",
        cue: "Flex the horseshoe tricep hard.",
      },
    ],
    exercises: [
      {
        name: "Incline Dumbbell Bicep Curl",
        device: "45° Incline Bench",
        sets: "3 Sets",
        reps: "10 - 12 Reps",
        rest: "75s",
        tempo: "3-1-1-1",
        proTip: "Keep upper arms perpendicular to floor; full supination at top.",
      },
      {
        name: "Overhead Cable Rope Extension",
        device: "Cable Pulley + Rope",
        sets: "4 Sets",
        reps: "10 - 12 Reps",
        rest: "75s",
        tempo: "3-1-1-1",
        proTip: "Allow rope to sink deep behind neck for deep long-head stretch.",
      },
      {
        name: "EZ-Bar Preacher Curl",
        device: "Preacher Bench + EZ Bar",
        sets: "3 Sets",
        reps: "10 - 12 Reps",
        rest: "60s",
        tempo: "3-0-1-0",
        proTip: "Stop 1 inch short of hyperextension at bottom to protect tendons.",
      },
      {
        name: "Straight-Bar Cable Pushdown",
        device: "High Cable Station",
        sets: "3 Sets",
        reps: "12 - 15 Reps",
        rest: "60s",
        tempo: "2-0-1-1",
        proTip: "Drop set final set by 30% weight to absolute failure.",
      },
    ],
    weeklyFrequency: "2x per week (direct isolation work)",
    progressionRule:
      "Never sacrifice strict elbow positioning for heavier dumbbells. Micro-progress by 0.5-1 kg.",
  },

  abs: {
    id: "abs",
    name: "Abs (Core & Obliques)",
    subtitle: "Deep Transverse & Six-Pack Compression Plan",
    targetHeads: [
      "Rectus Abdominis (Six-Pack)",
      "Transverse Abdominis (Waist Cinch)",
      "Internal & External Obliques",
      "Serratus Anterior",
    ],
    biomechanicsOverview:
      "The rectus abdominis flexes the lumbar spine, bringing sternum closer to the pelvis. Most lifters inadvertently train hip flexors (psoas) by hinging at the hips instead of curling their spine.",
    devices: [
      {
        name: "Captain's Chair / Hanging Knee Raise Station",
        category: "Bodyweight Apparatus",
        role: "Lower Abdominal Pelvic Curl Under Gravity",
        settingTip:
          "Back pad supported. Lift knees and curl pelvis upward toward chest, not just swinging legs.",
      },
      {
        name: "High Cable Pulley Station",
        category: "Cable Machine",
        role: "Weighted Kneeling Crunch Overload",
        settingTip:
          "Hold rope handles glued to sides of your head. Hips stay fixed at 90°; do not sit back on your heels.",
      },
      {
        name: "Decline Ab Crunch Bench",
        category: "Adjustable Bench",
        role: "Deep Progressive Abdominal Flexion",
        settingTip:
          "Hook feet securely. Lower torso smoothly and round your spine upward on each repetition.",
      },
      {
        name: "Ab Roller Wheel",
        category: "Free Gear",
        role: "Anti-Extension Core Stability & Transverse Brace",
        settingTip:
          "Start on knees with a posterior pelvic tilt. Squeeze glutes hard to protect lower back.",
      },
    ],
    instructions: [
      {
        title: "Posterior Pelvic Tilt",
        detail:
          "Tuck your tailbone under and curl your spine like a shrimp. Abs cannot contract fully if your lower back is arched.",
        cue: "Roll pelvis toward your ribs.",
      },
      {
        title: "Breathe Out All Air at Contraction",
        detail:
          "Forcefully exhale all oxygen from your lungs at peak squeeze. This brings the deep transverse abdominis into full contraction.",
        cue: "Blow out all air; brace like getting punched.",
      },
      {
        title: "Apply Progressive Overload",
        detail:
          "Abs are muscles that respond to load. Do not just do 50 bodyweight crunches; use cable weight stacks to stimulate growth.",
        cue: "Train abs with progressive resistance.",
      },
      {
        title: "Avoid Hip Flexor Pulling",
        detail:
          "If you feel burning in your upper thighs, you are hip hinging instead of flexing your abdominal wall.",
        cue: "Curling spine, not swinging hips.",
      },
    ],
    exercises: [
      {
        name: "Kneeling Cable Rope Crunch",
        device: "High Cable + Rope",
        sets: "4 Sets",
        reps: "12 - 15 Reps",
        rest: "60s",
        tempo: "2-1-1-1",
        proTip: "Curl elbows down toward knees; hips stay frozen in space.",
      },
      {
        name: "Hanging Leg & Pelvic Raise",
        device: "Captain's Chair / Pull-up Bar",
        sets: "4 Sets",
        reps: "12 - 15 Reps",
        rest: "60s",
        tempo: "2-0-1-1",
        proTip: "Tilt pelvis upward at top to isolate lower rectus abdominis.",
      },
      {
        name: "Ab Wheel Rollouts",
        device: "Ab Wheel",
        sets: "3 Sets",
        reps: "10 - 12 Reps",
        rest: "60s",
        tempo: "3-1-1-0",
        proTip: "Keep glutes locked tight; roll out only as far as back stays flat.",
      },
      {
        name: "Side Plank with Oblique Pulses",
        device: "Floor Mat",
        sets: "3 Sets",
        reps: "15 Reps / side",
        rest: "45s",
        tempo: "Controlled",
        proTip: "Elevate ribcage away from floor; squeeze side obliques.",
      },
    ],
    weeklyFrequency: "3x per week (48h recovery; fast recovering muscle group)",
    progressionRule:
      "Increase cable resistance by 1 plate once you can perform 15 strict reps with a 1-second exhale squeeze.",
  },

  legs: {
    id: "legs",
    name: "Legs (Quads & Hamstrings)",
    subtitle: "Quad Sweep & Hamstring Balance Blueprint",
    targetHeads: [
      "Vastus Lateralis (Outer Quad Sweep)",
      "Vastus Medialis (Teardrop)",
      "Rectus Femoris (Front Thigh)",
      "Biceps Femoris & Semitendinosus (Hamstrings)",
    ],
    biomechanicsOverview:
      "Maximum quad growth demands deep knee flexion with knees traveling forward over toes. Hamstrings act as both knee flexors (curls) and hip extensors (deadlifts/hinges) and require both movement patterns for complete growth.",
    devices: [
      {
        name: "Hack Squat / Pendulum Squat Machine",
        category: "Plate-Loaded Machine",
        role: "Extreme Knee Flexion Without Lumbar Fatigue",
        settingTip:
          "Place feet low-to-mid on platform. Elevate heels with small plates if ankle mobility restricts full depth.",
      },
      {
        name: "Seated Hamstring Leg Curl Machine",
        category: "Pin-Loaded Machine",
        role: "Lengthened-Position Hamstring Hypertrophy",
        settingTip:
          "Thigh pad clamped tightly down to keep hips from lifting. Seated leg curls produce superior growth over lying curls.",
      },
      {
        name: "45-Degree Leg Press Machine",
        category: "Plate-Loaded Machine",
        role: "High-Load Quad & Glute Hypertrophy",
        settingTip:
          "Shoulder-width stance; bring sled deep until knees reach ribcage level without lower back rounding off the seat.",
      },
      {
        name: "Leg Extension Machine",
        category: "Pin-Loaded Machine",
        role: "Rectus Femoris Shortened Peak Tension",
        settingTip:
          "Align knee joint directly with the machine pivot axis. Lower leg pad sits just above the ankle joint.",
      },
    ],
    instructions: [
      {
        title: "Knees Travel Forward Over Toes",
        detail:
          "Push your knees forward over your toes to maximize knee flexion and load the vastus lateralis and medialis.",
        cue: "Knees forward, chest tall like a goblet squat.",
      },
      {
        title: "Full Depth Below Parallel",
        detail:
          "Half reps build half legs. Descend until calves make contact with your hamstrings for maximum hypertrophy.",
        cue: "Touch hamstrings to calves under control.",
      },
      {
        title: "Hips Back on Romanian Deadlifts",
        detail:
          "Push your hips backward like reaching for a wall behind you with soft knees to load hamstring tendons safely.",
        cue: "Push butt back; feel hamstrings stretch like rubber bands.",
      },
      {
        title: "No Bouncing or Joint Locking",
        detail:
          "Keep continuous tension on the quads. Never violently slam or lock knee joints at the top of presses.",
        cue: "Smooth continuous piston motion.",
      },
    ],
    exercises: [
      {
        name: "Machine Hack Squat",
        device: "Hack Squat Platform",
        sets: "4 Sets",
        reps: "8 - 10 Reps",
        rest: "120s",
        tempo: "3-1-1-0",
        proTip: "Slow 3-second descent; pause 1 second at the bottom stretch.",
      },
      {
        name: "Seated Hamstring Leg Curl",
        device: "Hamstring Curl Machine",
        sets: "4 Sets",
        reps: "10 - 12 Reps",
        rest: "75s",
        tempo: "3-1-1-1",
        proTip: "Pull toes up (dorsiflexion); 1-second squeeze at full flexion.",
      },
      {
        name: "45° Leg Press",
        device: "Leg Press Machine",
        sets: "3 Sets",
        reps: "12 - 15 Reps",
        rest: "90s",
        tempo: "3-0-1-0",
        proTip: "Perform a drop-set on set 3 by stripping 2 plates per side.",
      },
      {
        name: "Dumbbell Romanian Deadlift",
        device: "Heavy Dumbbells",
        sets: "3 Sets",
        reps: "10 - 12 Reps",
        rest: "90s",
        tempo: "3-1-1-0",
        proTip: "Keep dumbbells grazing your shins; hinge from the hips.",
      },
      {
        name: "Leg Extension Finisher",
        device: "Leg Extension Machine",
        sets: "3 Sets",
        reps: "15 - 20 Reps",
        rest: "60s",
        tempo: "2-0-1-2",
        proTip: "Hold 2-second peak flex at top on every rep.",
      },
    ],
    weeklyFrequency: "2x per week (Day 1: Quad Dominant, Day 2: Hamstring/Glute Dominant)",
    progressionRule:
      "Legs respond heavily to progressive volume. Increase load when you can complete all sets at the top rep target.",
  },

  calves: {
    id: "calves",
    name: "Calves (Gastrocnemius & Soleus)",
    subtitle: "Achilles De-coupling & High-Density Protocol",
    targetHeads: [
      "Gastrocnemius (Medial & Lateral Heads)",
      "Soleus (Deep Postural Muscle)",
      "Tibialis Anterior (Shin Muscle)",
    ],
    biomechanicsOverview:
      "The Achilles tendon is an elastic spring engineered to store energy and bounce you forward during walking. To actually trigger calf hypertrophy, you MUST pause for 3 seconds in the bottom stretch to dissipate all elastic recoil before pressing up.",
    devices: [
      {
        name: "Standing Calf Raise / Smith Machine",
        category: "Machine / Free Weights",
        role: "Gastrocnemius (Straight-Leg Focus)",
        settingTip:
          "Keep knees completely straight (micro-flexed, not bent). Elevate balls of feet on a solid 4-inch raised platform.",
      },
      {
        name: "Seated Calf Raise Machine",
        category: "Pin-Loaded Machine",
        role: "Soleus (Bent-Knee Focus)",
        settingTip:
          "Knees bent at 90° eliminates gastrocnemius tension and isolates 100% of the load onto the soleus muscle.",
      },
      {
        name: "45° Leg Press Machine (Toe Press)",
        category: "Plate-Loaded Machine",
        role: "Heavy Ankle Plantarflexion Overload",
        settingTip:
          "Position balls of feet on bottom edge of the sled. Safety stops engaged so sled cannot drop past range.",
      },
    ],
    instructions: [
      {
        title: "The Mandatory 3-Second Stretch Pause",
        detail:
          "Pause for 3 full seconds at the bottom stretch on every single rep. This dead-stops the Achilles tendon and forces muscle fibers to work.",
        cue: "Count 3-2-1 in the deep stretch.",
      },
      {
        title: "Drive Through the Ball of Big Toe",
        detail:
          "Do not roll onto the outside of your feet. Drive down hard through the ball of the big toe to ignite the inner medial head.",
        cue: "Press straight through the big toe knuckle.",
      },
      {
        title: "Straight Knee vs 90° Bent Knee",
        detail:
          "Gastrocnemius attaches above the knee and only works with straight legs. Soleus works when knees are bent at 90°. You must do both.",
        cue: "Standing for gastroc, seated for soleus.",
      },
      {
        title: "Maximum Elevation Peak",
        detail:
          "Rise up as high as humanly possible onto tiptoes; hold peak contraction for 1 second before lowering.",
        cue: "Stand on the very tips of your toes.",
      },
    ],
    exercises: [
      {
        name: "Standing Smith Machine Calf Raise",
        device: "Smith Machine + Calf Block",
        sets: "4 Sets",
        reps: "10 - 12 Reps",
        rest: "75s",
        tempo: "3-3-1-1",
        proTip: "Mandatory 3-second pause at bottom on every repetition.",
      },
      {
        name: "Seated Calf Raise Machine",
        device: "Seated Calf Machine",
        sets: "4 Sets",
        reps: "12 - 15 Reps",
        rest: "60s",
        tempo: "3-2-1-1",
        proTip: "Feel the burn deep underneath the calves in the soleus.",
      },
      {
        name: "Leg Press Calf Toe Press",
        device: "Leg Press Machine",
        sets: "3 Sets",
        reps: "20 Reps",
        rest: "60s",
        tempo: "2-1-1-1",
        proTip: "Continuous tension pump set; do not bounce.",
      },
    ],
    weeklyFrequency: "3 to 4x per week (Calves recover very fast from high daily endurance)",
    progressionRule:
      "Increase stretch depth and isometric hold stability before adding weight plates.",
  },

  flexibility: {
    id: "flexibility",
    name: "Mobility & Joint Health",
    subtitle: "Myofascial Release & Joint Freedom Blueprint",
    targetHeads: [
      "Hip Flexors & Psoas Complex",
      "Thoracic Spine & Scapular Range",
      "Hamstring Fascia & Glute Medius",
      "Ankle Dorsiflexion & Achilles",
    ],
    biomechanicsOverview:
      "Muscles cannot fully hypertrophy through a restricted range of motion. Tight joint capsules cause compensatory movement patterns and premature neural fatigue. Daily mobility unlocks optimal fiber recruitment.",
    devices: [
      {
        name: "High-Density Foam Roller & Lacrosse Ball",
        category: "Myofascial Gear",
        role: "Trigger Point Release & Fascial Hydration",
        settingTip:
          "Roll slowly over tight tissue; pause on tender trigger points for 30-45 seconds until you feel the tissue release.",
      },
      {
        name: "Heavy Resistance Mobility Bands",
        category: "Elastic Loop Bands",
        role: "Joint Flossing & Capsule Distraction",
        settingTip:
          "Anchor band to a sturdy rack at hip height; place band high in hip crease to traction the joint.",
      },
      {
        name: "Slant Board / Incline Wedge",
        category: "Mobility Wedge",
        role: "Ankle Dorsiflexion & Posterior Chain Stretch",
        settingTip:
          "Stand on slant board with heels low to stretch gastrocnemius, soleus, and plantar fascia.",
      },
      {
        name: "Yoga Mat & Foam Blocks",
        category: "Floor Support",
        role: "Stable Grounding for End-Range PNF Holds",
        settingTip:
          "Use blocks under knees or hands to keep spine neutral during deep hip openings.",
      },
    ],
    instructions: [
      {
        title: "Parasympathetic Diaphragmatic Breathing",
        detail:
          "Inhale through your nose for 4 seconds, exhale smoothly through your mouth for 6 seconds. Deep breathing signals muscle spindles to release tension.",
        cue: "Inhale 4s, exhale 6s; melt into the floor.",
      },
      {
        title: "Contract-Relax (PNF) Technique",
        detail:
          "In a deep stretch, contract the muscle at 20% effort against resistance for 5 seconds, exhale, and sink 1 inch deeper.",
        cue: "Tense for 5s, exhale, sink deeper.",
      },
      {
        title: "Never Force Sharp Joint Pain",
        detail:
          "Mobility work should feel like pleasant tissue elongation (6/10 intensity). Never force sharp joint pinching.",
        cue: "Pleasant tissue stretch, zero joint pinch.",
      },
      {
        title: "Daily Frequency Over Heroic Workouts",
        detail:
          "10 minutes of daily mobility creates 10x better long-term joint health than a single 60-minute painful session per week.",
        cue: "Consistency every single day.",
      },
    ],
    exercises: [
      {
        name: "Thoracic Spine Foam Roller Extensions",
        device: "Foam Roller",
        sets: "3 Sets",
        reps: "10 Slow Waves",
        rest: "30s",
        tempo: "Slow & deep",
        proTip: "Interlock fingers behind head; open elbows wide to ceiling.",
      },
      {
        name: "Banded Hip Flexor & Psoas Stretch",
        device: "Heavy Mobility Band",
        sets: "3 Sets",
        reps: "45s each side",
        rest: "30s",
        tempo: "Continuous hold",
        proTip: "Squeeze the trailing glute hard to push hip forward.",
      },
      {
        name: "Slant Board Deep Squat Hold",
        device: "Slant Board / Wedge",
        sets: "3 Sets",
        reps: "60s Hold",
        rest: "45s",
        tempo: "Passive hold",
        proTip: "Keep spine tall; breathe into the pelvic floor.",
      },
      {
        name: "Banded Shoulder Dislocations",
        device: "Light Elastic Band",
        sets: "2 Sets",
        reps: "15 Smooth Sweeps",
        rest: "30s",
        tempo: "Controlled",
        proTip: "Wide grip; sweep smoothly from hips to lower back without bending elbows.",
      },
    ],
    weeklyFrequency: "Daily (5-10 minutes) or post-workout when warm",
    progressionRule:
      "Advance to deeper joint angles and gradually decrease reliance on bands and blocks.",
  },
};

interface WeakMusclePlanModalProps {
  muscleId: string | null;
  onClose: () => void;
}

export default function WeakMusclePlanModal({
  muscleId,
  onClose,
}: WeakMusclePlanModalProps) {
  const [activeTab, setActiveTab] = useState<
    "devices" | "instructions" | "routine" | "frequency"
  >("devices");

  if (!muscleId) return null;

  const protocol: MuscleProtocol =
    MUSCLE_PROTOCOLS[muscleId] || MUSCLE_PROTOCOLS.chest;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <style>{`
        .modal-card {
          background: #0d0d0d;
          border: 1px solid #222222;
          border-radius: 20px;
          max-width: 860px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.95);
          overflow: hidden;
          position: relative;
          animation: modalAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .tab-btn {
          display: flex;
          align-items: center;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .device-card {
          background: #121212;
          border: 1px solid #1e1e1e;
          border-radius: 14px;
          padding: 16px 18px;
          transition: all 0.2s ease;
        }
        .device-card:hover {
          border-color: #333333;
          background: #151515;
          transform: translateY(-2px);
        }

        .instruction-card {
          background: #121212;
          border: 1px solid #1e1e1e;
          border-radius: 14px;
          padding: 18px;
          position: relative;
        }

        .exercise-card {
          background: #121212;
          border: 1px solid #1e1e1e;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (max-width: 640px) {
          .modal-card {
            border-radius: 16px;
            max-height: 94vh;
          }
          .tab-btn {
            padding: 8px 12px;
            font-size: 11.5px;
          }
        }
      `}</style>

      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1c1c1c",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            background: "#0d0d0d",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#c8ff00",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  background: "#181818",
                  border: "1px solid #282828",
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                Priority Correction
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#777",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Biomechanical Blueprint
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#f1ede5",
                lineHeight: 1.1,
              }}
            >
              {protocol.name}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12.5,
                color: "#888",
                letterSpacing: "0.02em",
              }}
            >
              {protocol.subtitle}
            </p>
          </div>

          {/* Close button (clean text character, no icon) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "#181818",
              border: "1px solid #282828",
              color: "#aaa",
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#aaa";
              e.currentTarget.style.borderColor = "#282828";
            }}
          >
            ✕
          </button>
        </div>

        {/* Anatomical Target Badges Bar */}
        <div
          style={{
            padding: "10px 24px",
            background: "#101010",
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#666",
            }}
          >
            Focal Anatomy:
          </span>
          {protocol.targetHeads.map((head, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#ddd",
                background: "#161616",
                border: "1px solid #222222",
                padding: "3px 10px",
                borderRadius: 20,
                letterSpacing: "0.02em",
              }}
            >
              {head}
            </span>
          ))}
        </div>

        {/* Tabs Navigation (No Icons) */}
        <div
          style={{
            padding: "12px 24px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            borderBottom: "1px solid #1c1c1c",
            background: "#0d0d0d",
          }}
        >
          <button
            type="button"
            className="tab-btn"
            onClick={() => setActiveTab("devices")}
            style={{
              background: activeTab === "devices" ? "#c8ff00" : "transparent",
              color: activeTab === "devices" ? "#090909" : "#888",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            Recommended Devices
          </button>

          <button
            type="button"
            className="tab-btn"
            onClick={() => setActiveTab("instructions")}
            style={{
              background:
                activeTab === "instructions" ? "#c8ff00" : "transparent",
              color: activeTab === "instructions" ? "#090909" : "#888",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            Technique Instructions
          </button>

          <button
            type="button"
            className="tab-btn"
            onClick={() => setActiveTab("routine")}
            style={{
              background: activeTab === "routine" ? "#c8ff00" : "transparent",
              color: activeTab === "routine" ? "#090909" : "#888",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            Corrective Workout
          </button>

          <button
            type="button"
            className="tab-btn"
            onClick={() => setActiveTab("frequency")}
            style={{
              background: activeTab === "frequency" ? "#c8ff00" : "transparent",
              color: activeTab === "frequency" ? "#090909" : "#888",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            Volume & Rules
          </button>
        </div>

        {/* Tab Body Content (Scrollable) */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* TAB 1: DEVICES */}
          {activeTab === "devices" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  background: "#121212",
                  border: "1px solid #202020",
                  borderRadius: 14,
                  padding: "14px 16px",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "#d8d4cb",
                }}
              >
                <strong style={{ color: "#c8ff00" }}>
                  Equipment Rationale:{" "}
                </strong>
                {protocol.biomechanicsOverview}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 14,
                }}
              >
                {protocol.devices.map((device, idx) => (
                  <div key={idx} className="device-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#c8ff00",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Device #{idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#777",
                          background: "#181818",
                          padding: "2px 8px",
                          borderRadius: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {device.category}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: "0 0 6px",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#f1ede5",
                      }}
                    >
                      {device.name}
                    </h3>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#c8ff00",
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {device.role}
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 12.5,
                        color: "#999",
                        lineHeight: 1.45,
                        borderTop: "1px solid #1c1c1c",
                        paddingTop: 8,
                      }}
                    >
                      <strong style={{ color: "#bbb" }}>Setup Cue: </strong>
                      {device.settingTip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INSTRUCTIONS */}
          {activeTab === "instructions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {protocol.instructions.map((inst, idx) => (
                  <div key={idx} className="instruction-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: "#1c1c1c",
                          color: "#c8ff00",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: "#f1ede5",
                        }}
                      >
                        {inst.title}
                      </h3>
                    </div>

                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: 13,
                        color: "#999",
                        lineHeight: 1.5,
                      }}
                    >
                      {inst.detail}
                    </p>

                    <div
                      style={{
                        background: "#161616",
                        borderLeft: "3px solid #c8ff00",
                        padding: "8px 12px",
                        borderRadius: "0 8px 8px 0",
                        fontSize: 12,
                        color: "#c8ff00",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      Coaching Cue: &ldquo;{inst.cue}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CORRECTIVE WORKOUT ROUTINE */}
          {activeTab === "routine" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#777",
                }}
              >
                <span>Recommended Priority Exercises</span>
                <span style={{ color: "#c8ff00" }}>4 Core Movements</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {protocol.exercises.map((ex, idx) => (
                  <div key={idx} className="exercise-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: "#c8ff00",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: 2,
                          }}
                        >
                          Step {idx + 1} • {ex.device}
                        </div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#f1ede5",
                          }}
                        >
                          {ex.name}
                        </h3>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: "#181818",
                          border: "1px solid #242424",
                          padding: "4px 10px",
                          borderRadius: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#c8ff00",
                          }}
                        >
                          {ex.sets}
                        </span>
                        <span style={{ color: "#444" }}>•</span>
                        <span style={{ fontSize: 12, color: "#ddd" }}>
                          {ex.reps}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                        fontSize: 11.5,
                        color: "#777",
                        borderTop: "1px solid #1a1a1a",
                        paddingTop: 8,
                      }}
                    >
                      <span>
                        Rest: <strong style={{ color: "#bbb" }}>{ex.rest}</strong>
                      </span>
                      <span>
                        Tempo: <strong style={{ color: "#bbb" }}>{ex.tempo}</strong>
                      </span>
                      <span style={{ color: "#aaa" }}>
                        <strong style={{ color: "#c8ff00" }}>Tip: </strong> {ex.proTip}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FREQUENCY & PERIODIZATION */}
          {activeTab === "frequency" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "#121212",
                  border: "1px solid #1e1e1e",
                  borderRadius: 14,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#f1ede5",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Optimal Training Frequency
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    color: "#bbb",
                    lineHeight: 1.5,
                  }}
                >
                  {protocol.weeklyFrequency}
                </p>
                <div
                  style={{
                    background: "#181818",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#999",
                  }}
                >
                  <strong style={{ color: "#c8ff00" }}>Priority Placement Rule: </strong>
                  Always perform these corrective exercises at the very start of
                  your workout session when muscular glycogen and neurological
                  drive are at 100%.
                </div>
              </div>

              <div
                style={{
                  background: "#121212",
                  border: "1px solid #1e1e1e",
                  borderRadius: 14,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#f1ede5",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Progressive Overload Rule
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    color: "#bbb",
                    lineHeight: 1.5,
                  }}
                >
                  {protocol.progressionRule}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions (Apply button removed, no green shadow) */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #1c1c1c",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#666",
              letterSpacing: "0.02em",
            }}
          >
            Target Focus:{" "}
            <strong style={{ color: "#c8ff00" }}>{protocol.name}</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#1c1c1c",
              border: "1px solid #2e2e2e",
              color: "#f1ede5",
              padding: "9px 24px",
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#252525";
              e.currentTarget.style.borderColor = "#444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1c1c1c";
              e.currentTarget.style.borderColor = "#2e2e2e";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
