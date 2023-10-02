import React, { useEffect, useMemo, useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl, useIntl } from 'react-intl';
import injectNotify from '/imports/ui/components/common/toast/inject-notify/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import BreakoutService from '/imports/ui/components/breakout-room/service';
import { Text, Time } from './styles';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { isEmpty } from 'radash';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';
import { useQuery } from '@apollo/client';
import { GET_BREAKOUT_DATA, breakoutDataResponse } from './queries';
import { notify } from '/imports/ui/services/notification';
import { Meteor } from 'meteor/meteor';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import { CurrentPage } from '/imports/ui/Types/presentation';

const intlMessages = defineMessages({
  failedMessage: {
    id: 'app.failedMessage',
    description: 'Notification for connecting to server problems',
  },
  connectingMessage: {
    id: 'app.connectingMessage',
    description: 'Notification message for when client is connecting to server',
  },
  waitingMessage: {
    id: 'app.waitingMessage',
    description: 'Notification message for disconnection with reconnection counter',
  },
  breakoutTimeRemaining: {
    id: 'app.breakoutTimeRemainingMessage',
    description: 'Message that tells how much time is remaining for the breakout room',
  },
  breakoutWillClose: {
    id: 'app.breakoutWillCloseMessage',
    description: 'Message that tells time has ended and breakout will close',
  },
  calculatingBreakoutTimeRemaining: {
    id: 'app.calculatingBreakoutTimeRemaining',
    description: 'Message that tells that the remaining time is being calculated',
  },
  alertBreakoutEndsUnderMinutes: {
    id: 'app.meeting.alertBreakoutEndsUnderMinutes',
    description: 'Alert that tells that the breakout ends under x minutes',
  },
  alertMeetingEndsUnderMinutes: {
    id: 'app.meeting.alertMeetingEndsUnderMinutes',
    description: 'Alert that tells that the meeting ends under x minutes',
  },
});

interface MeetingRemainingTimeProps {
  componentMessage: string | '';
  bold: boolean;
}

interface MeetingRemainingTimeContainerProps {
  message: string | '';
  bold: boolean;
  timeRemaining: number;
  isBreakoutDuration?: boolean;
  // breakoutRoom: { timeRemaining: number } | null;
  messageDuration: { id: string, description: string};
  timeEndedMessage: { id: string, description: string};
  fromBreakoutPanel: string;
  displayAlerts: boolean;
}

const defaultProps = {
  isBreakoutDuration: false,
};

// TODO define inside last function
// let timeRemaining: number = 0;
let lastAlertTime: number | null = null;

const METEOR_SETTINGS_APP = Meteor.settings.public.app;
const REMAINING_TIME_ALERT_THRESHOLD_ARRAY: [number] = METEOR_SETTINGS_APP.remainingTimeAlertThresholdArray;

const MeetingRemainingTime: React.FC<MeetingRemainingTimeProps> = ({ componentMessage, bold }) => {
  if (isEmpty(componentMessage)) return null;

  if (bold) {
    const words = componentMessage.split(' ');
    const time = words.pop();
    const text = words.join(' ');

    return (
      <span data-test="timeRemaining">
        <Text>{text}</Text>
        <br />
        <Time data-test="breakoutRemainingTime">{time}</Time>
      </span>
    );
  }

  return (
    <span data-test="timeRemaining">
      {componentMessage}
    </span>
  );
};

const MeetingRemainingTimeContainer: React.FC<MeetingRemainingTimeContainerProps> = ({
  message,
  bold,
  timeRemaining,
  isBreakoutDuration,
  messageDuration,
  timeEndedMessage,
  fromBreakoutPanel,
  displayAlerts,
}) => {
  const intl = useIntl();
  // ta sendo usado em varios lugares mas deve ter um só pra duração generico
  let duration: number | undefined;
  let referenceStartedTime: number | undefined;

  const currentMeeting = useMeeting((m) => {
    return {
      meetingId: m?.meetingId,
      isBreakout: m?.isBreakout,
      duration: m?.duration,
      createdTime: m?.createdTime,
    };
  });

  const meetingId = currentMeeting?.meetingId;
  const isBreakout = currentMeeting?.isBreakout;

  if (isBreakoutDuration) {
    const {
      data: breakoutData,
    } = useQuery<breakoutDataResponse>(GET_BREAKOUT_DATA, { variables: { meetingId } });

    duration = breakoutData?.breakoutRoom[0]?.durationInSeconds;
    const breakoutStartedTime: string | undefined = breakoutData?.breakoutRoom[0]?.startedAt;
    referenceStartedTime = breakoutStartedTime ? new Date(breakoutStartedTime).getTime() : undefined;
  } else {
    duration = currentMeeting?.duration;
    referenceStartedTime = currentMeeting?.createdTime;
  }

  const [remainingTime, setRemainingTime] = useState<number>(-1);
  const timeRemainingInterval = React.useRef<ReturnType<typeof setTimeout>>();
  console.log('_____');
  console.log({ timeRemaining });

  let componentMessage: string = message;
  let boldText: boolean = bold;

  const calculateAndSetRemainingTime = () => {
    console.log(`cruzis credo === ${parseInt(((referenceStartedTime + (duration * 60000)) - Date.now()) / 1000)}`);
    setRemainingTime(parseInt(String(((referenceStartedTime + (duration * 60000)) - Date.now()) / 1000)));
  };

  useEffect(() => {
    if (remainingTime && duration) {
      console.log(`log remaining => ${parseInt(((referenceStartedTime + (duration * 60000)) - Date.now()) / 1000)}`);
      if (timeRemaining > 0 && remainingTime < 0 && referenceStartedTime && duration) {
        calculateAndSetRemainingTime();
      }
      clearInterval(timeRemainingInterval.current);
      // if (remainingTime > 0) {
      timeRemainingInterval.current = setInterval(() => {
        setRemainingTime((currentTime) => currentTime - 1);
      }, 1000);
      // }
    }

    return () => {
      clearInterval(timeRemainingInterval.current);
    };
  }, [remainingTime]);

  if (remainingTime >= 0 && timeRemainingInterval) {
    if (remainingTime > 0) {
      const alertsInSeconds = REMAINING_TIME_ALERT_THRESHOLD_ARRAY.map((item) => item * 60);

      if (alertsInSeconds.includes(remainingTime) && remainingTime !== lastAlertTime && displayAlerts) {
        const timeInMinutes = remainingTime / 60;
        const message = isBreakout
          ? intlMessages.alertBreakoutEndsUnderMinutes
          : intlMessages.alertMeetingEndsUnderMinutes;
        const msg = { id: `${message.id}${timeInMinutes === 1 ? 'Singular' : 'Plural'}` };
        const alertMessage = intl.formatMessage(msg, { 0: timeInMinutes });

        lastAlertTime = remainingTime;
        notify(alertMessage, 'info', 'rooms');
      }
      componentMessage = intl.formatMessage(messageDuration, { 0: humanizeSeconds(remainingTime) });
      if (fromBreakoutPanel) boldText = true;
    } else {
      clearInterval(timeRemainingInterval.current);
      BreakoutService.setCapturedContentUploading();
      componentMessage = intl.formatMessage(timeEndedMessage || intlMessages.breakoutWillClose);
    }
  } else if (timeRemaining >= 0) {
    componentMessage = intl.formatMessage(intlMessages.calculatingBreakoutTimeRemaining);
  }

  return (
    <MeetingRemainingTime
      componentMessage={componentMessage}
      bold={boldText}
    />
  );
};

MeetingRemainingTimeContainer.defaultProps = defaultProps;

export default MeetingRemainingTimeContainer;
