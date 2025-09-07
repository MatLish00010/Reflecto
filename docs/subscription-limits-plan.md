# Subscription Limits Implementation Plan

## 📋 Overview

This document describes the implementation plan for a subscription-based limitation system to differentiate functionality between free and premium users in the Reflecto application.

## 🎯 Goals

1. **Monetization**: Create clear incentives for upgrading to premium plans
2. **Retention**: Retain users by providing sufficient value in the free tier
3. **UX**: Ensure transparency of limitations and ease of upgrade

## 📊 Subscription Tiers Definition

### Trial Period (7 days)
```
🎁 Full access to all features
📅 Reminders on days 3 and 6
🚀 Goal: Show product value
```

### Free Tier
```
📝 Notes: Unlimited
✏️ Editing: Up to 24 hours after creation
📚 History: 1 week (view only)
💾 Storage: 1 week
🤖 Summaries: 5 daily summaries per day
📊 Analytics: Standard (metrics + charts)
📤 Export: TXT (available to all)
📏 Note length: Up to 2000 characters
🎤 Voice input: 1 recording per day (up to 2 minutes)
🎮 Gamification: Basic (achievements, streaks)
```

### Premium Tier
```
📝 Notes: Unlimited
✏️ Editing: No time restrictions
📚 History: Full history
💾 Storage: All data (permanent)
🤖 Summaries: Daily + weekly + monthly
📊 Analytics: Full + predictions + comparisons
📤 Export: TXT (available to all)
📏 Note length: Unlimited
🎤 Voice input: Unlimited (up to 2 minutes per recording)
🎮 Gamification: Extended (achievements, streaks, leaderboards)
```

## 🚀 Implementation Plan (Updated)

### **Phase 1: Basic Infrastructure (2-3 days)**
- [ ] Create types and configuration with trial period
- [ ] Implement `SubscriptionLimitsService`
- [ ] Create middleware for limit checking
- [ ] Add trial period system

### **Phase 2: Soft Limitations (2-3 days)**
- [ ] Implement time-based editing restrictions (`SOFT_LIMITS_ENABLED`)
- [ ] Add note length limitations
- [ ] Keep TXT export available to all users
- [ ] **Add voice input limitations** (1 recording per day for free users, up to 2 minutes)
- [ ] Create progress bars for all limits

### **Phase 3: History and Storage Limitations (2-3 days)**
- [ ] Implement 1-week history limit for free users
- [ ] Create automatic cleanup system for old data
- [ ] Add warnings about limited history
- [ ] Create smooth transition from trial to free

### **Phase 4: Summary Limitations (2-3 days)**
- [ ] Limit free users to daily summaries only
- [ ] Add weekly and monthly summaries for premium users
- [ ] Create UI for limited summaries
- [ ] Add upgrade prompts for advanced summaries

### **Phase 5: Enhanced Analytics (2-3 days)**
- [ ] Expand analytics for free users
- [ ] Add charts and visualizations
- [ ] Create limited version for free users
- [ ] Implement premium analytics features

### **Phase 6: UX Improvements (3-4 days)**
- [ ] Contextual tips for limitations (`CONTEXTUAL_TIPS_ENABLED`)
- [ ] Personalized upgrade offers (`PERSONALIZED_OFFERS_ENABLED`)
- [ ] Improved modal windows with explanations
- [ ] Notification and reminder system

### **Phase 7: Gamification (2-3 days)**
- [ ] Basic gamification for all users (`GAMIFICATION_ENABLED`)
- [ ] Achievement and badge system (basic for all)
- [ ] Streaks and statistics (basic for all)
- [ ] Extended features for premium (leaderboards, social elements)

### **Phase 8: Optimization and Monitoring (1-2 days)**
- [ ] A/B testing of limitations
- [ ] Conversion analytics
- [ ] Metrics monitoring
- [ ] Automatic data cleanup

## 🎤 Voice Input Limitations

### **Current Implementation**
- Uses OpenAI Whisper API for speech-to-text conversion
- Rate limit: 15 requests per 5 minutes (upload config)
- Maximum file size: 25MB
- Supports various audio formats

### **Proposed Limitations**

#### **Free Tier**
- **Number of recordings**: 1 voice recording per day
- **Duration**: Up to 2 minutes per recording
- **File size**: Up to 5MB per recording
- **Format**: Basic recognition

#### **Premium Tier**
- **Number of recordings**: Unlimited
- **Duration**: Up to 2 minutes per recording (standard)
- **File size**: Up to 25MB per recording
- **Format**: Extended recognition with prompts

### **Technical Implementation**
```typescript
// Voice input limit checking
interface VoiceRecordingLimits {
  dailyRecordings: number;
  maxDurationMinutes: number;
  maxFileSizeMB: number;
  allowPrompts: boolean;
}

// Usage example
const limits = getUserLimits(userId);
if (limits.dailyRecordings !== -1 && 
    userDailyRecordings >= limits.dailyRecordings) {
  showUpgradePrompt('voice_recording_limit');
}
```

## 🎨 UX Improvements

### **1. Contextual Tips**
```typescript
// Example: When trying to edit an old note
if (noteAge > 24 && tier === 'free') {
  showContextualTip({
    message: "Editing is only available within 24 hours in the free version",
    action: "upgrade",
    benefit: "Get unlimited editing with Premium"
  });
}

// Example: When reaching voice recording limit
if (dailyVoiceRecordings >= 1 && tier === 'free') {
  showContextualTip({
    message: "You've used your voice recording for today",
    action: "upgrade",
    benefit: "Get unlimited voice recordings with Premium"
  });
}

// Example: When exceeding recording duration
if (recordingDuration > 120 && tier === 'free') {
  showRecordingWarning({
    message: "Maximum recording duration: 2 minutes",
    currentTime: recordingDuration,
    maxTime: 120,
    action: "upgrade"
  });
}
```

### **2. Personalized Offers**
```typescript
// Example: Based on user behavior
if (user.dailyNotesAverage > 3 && tier === 'free') {
  showPersonalizedOffer({
    message: "You create many notes! Premium will give you more opportunities",
    discount: "20%",
    urgency: "limited_time"
  });
}

// Example: For active voice input users
if (user.voiceRecordingUsage > 0.8 && tier === 'free') {
  showPersonalizedOffer({
    message: "You often use voice input! Premium removes all limitations",
    discount: "15%",
    urgency: "voice_user_special"
  });
}
```

### **3. Smooth Transitions**
```typescript
// Example: Graceful degradation instead of blocking
if (limitReached) {
  showUpgradePrompt({
    mode: "preview", // show how the feature looks
    allowPreview: true, // allow preview
    cta: "upgrade_to_unlock"
  });
}
```

## 📈 Expected Results

> **Note**: Numbers are based on analysis of similar services and may vary depending on audience and market.

### **Conversion Metrics (Realistic)**
- **Trial → Premium**: 15-25% (SaaS standard)
- **Free → Premium**: 8-15% (typical for freemium)
- **Overall conversion**: 10-20%

### **Retention Metrics**
- **Retention (30 days)**: 70-80% (good indicator)
- **Churn rate**: 20-30% (normal for new users)
- **User satisfaction**: +20-30% (UX improvement)

### **Revenue Metrics (Conservative)**
- **Revenue growth**: 150-300% (realistic for first year)
- **ARPU**: +50-100% (average check growth)
- **LTV**: +100-200% (lifetime value increase)

## 🔧 Technical Details

### **New Components**
```typescript
// Trial period components
<TrialStatusBar />
<TrialReminderModal />
<TrialExpiredModal />

// Limitation components
<UsageProgressBar />
<ContextualUpgradeTip />
<PersonalizedOffer />

// Voice input components
<VoiceRecordingLimits />
<RecordingDurationWarning />
<VoiceUsageProgressBar />

// Gamification components
<AchievementBadge />
<StreakCounter />
<ProgressRing />
```

### **New Services**
```typescript
// Trial period services
TrialService
PersonalizationService
GamificationService

// Analytics services
ConversionAnalyticsService
UserBehaviorService
LimitOptimizationService
```

## 🧪 Testing Plan

### **A/B Tests**
- [ ] Different limitations for free users
- [ ] Different trial period durations
- [ ] Different notification approaches
- [ ] Different pricing and offers

### **Metrics to Track**
- [ ] Conversion at each funnel stage
- [ ] Time to first limit reached
- [ ] Frequency of limited feature usage
- [ ] User feedback and satisfaction

## 🚀 Deployment

### **Phased Deployment**
1. **Week 1**: Basic infrastructure + soft limitations
2. **Week 2**: History limitations + summaries
3. **Week 3**: Analytics + UX improvements
4. **Week 4**: Gamification + optimization

### **Feature Flags**
```typescript
export const FEATURE_FLAGS = {
  // Trial period for new users
  TRIAL_PERIOD_ENABLED: true,
  
  // Soft limitations (editing up to 24 hours, note length)
  SOFT_LIMITS_ENABLED: true,
  
  // Gamification (achievements, streaks, badges)
  GAMIFICATION_ENABLED: true,
  
  // Personalized offers based on behavior
  PERSONALIZED_OFFERS_ENABLED: true,
  
  // Contextual tips when reaching limits
  CONTEXTUAL_TIPS_ENABLED: true,
};
```

### **Feature Flag Descriptions**

#### **TRIAL_PERIOD_ENABLED**
- **Purpose**: Enables 7-day trial period for new users
- **Implementation**: Phase 3 - Trial Period
- **Components**: `TrialStatusBar`, `TrialReminderModal`, `TrialExpiredModal`

#### **SOFT_LIMITS_ENABLED**
- **Purpose**: Enables soft limitations instead of hard blocks
- **Implementation**: Phase 2 - Soft Limitations
- **Features**: Editing up to 24 hours, note length limitations

#### **GAMIFICATION_ENABLED**
- **Purpose**: Enables achievement and motivation system
- **Implementation**: Phase 7 - Gamification
- **Components**: `AchievementBadge`, `StreakCounter`, `ProgressRing`

#### **PERSONALIZED_OFFERS_ENABLED**
- **Purpose**: Enables personalized upgrade offers
- **Implementation**: Phase 6 - UX Improvements
- **Features**: Behavior analysis, individual offers

#### **CONTEXTUAL_TIPS_ENABLED**
- **Purpose**: Enables contextual tips for limitations
- **Implementation**: Phase 6 - UX Improvements
- **Components**: `ContextualUpgradeTip`, `UsageProgressBar`

## 📋 Readiness Checklist

### **Phase 1: Basic Infrastructure**
- [ ] Types and interfaces created
- [ ] `SubscriptionLimitsService` implemented
- [ ] Middleware for limit checking created
- [ ] Trial period system added

### **Phase 2: Soft Limitations**
- [ ] Time-based editing restrictions implemented
- [ ] Note length limitations added
- [ ] TXT export kept available to all users
- [ ] **Voice input limitations implemented** (1 recording per day for free users, up to 2 minutes)
- [ ] Progress bars for all limits created

### **Phase 3: History and Storage Limitations**
- [ ] 1-week history limit for free users implemented
- [ ] Automatic cleanup system for old data created
- [ ] Warnings about limited history added
- [ ] Smooth transition from trial to free created

### **Phase 4: Summary Limitations**
- [ ] Free users limited to daily summaries only
- [ ] Weekly and monthly summaries added for premium users
- [ ] UI for limited summaries created
- [ ] Upgrade prompts for advanced summaries added

### **Phase 5: Enhanced Analytics**
- [ ] Analytics for free users expanded
- [ ] Charts and visualizations added
- [ ] Limited version for free users created
- [ ] Premium analytics features implemented

### **Phase 6: UX Improvements**
- [ ] Contextual tips for limitations added
- [ ] Personalized upgrade offers implemented
- [ ] Improved modal windows with explanations created
- [ ] Notification and reminder system added

### **Phase 7: Gamification**
- [ ] Basic achievement and badge system implemented (for all)
- [ ] Streaks and statistics added (for all)
- [ ] Extended features for premium (leaderboards, social elements)
- [ ] Motivational elements created

### **Phase 8: Optimization and Monitoring**
- [ ] A/B testing of limitations configured
- [ ] Conversion analytics implemented
- [ ] Metrics monitoring configured
- [ ] Automatic data cleanup implemented

---

## 🎯 Key Principles

1. **Value before limitations** - show value, don't block
2. **Smooth transitions** - graceful degradation instead of hard blocks
3. **Personalization** - individual offers based on behavior
4. **Transparency** - clear explanations of limitations and benefits
5. **Gamification** - motivation through achievements and progress

---

*This plan is based on analysis of best practices from services like Notion, Obsidian, Day One, Evernote, Spotify and other successful freemium products, as well as modern UX design principles.*
