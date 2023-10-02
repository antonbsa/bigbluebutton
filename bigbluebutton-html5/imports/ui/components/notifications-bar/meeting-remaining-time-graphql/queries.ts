import { gql } from '@apollo/client';

export type breakoutDataResponse = {
  breakoutRoom: {
    durationInSeconds: number;
    startedAt: string;
  }[];
}

export const GET_BREAKOUT_DATA = gql`
  query getBreakoutData($meetingId: String!) {
    breakoutRoom(limit: 1, where: { parentMeetingId: { _eq: $meetingId }}) {
      durationInSeconds
      startedAt
      userId
    }
  }
`;

export default {
  GET_BREAKOUT_DATA,
};
