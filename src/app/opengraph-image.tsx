import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Art by Des Green — original oil paintings by South African artist Des Green.';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7f1e7',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontStyle: 'italic',
            color: '#94431f',
            fontFamily: 'serif',
          }}
        >
          Art by Des
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 22,
            letterSpacing: 8,
            color: '#4a4038',
          }}
        >
          DES GREEN
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 40,
            color: '#2a241e',
            fontFamily: 'serif',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          Original Oil Paintings
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 24,
            color: '#4a4038',
          }}
        >
          South African Artist · East London, South Africa
        </div>
      </div>
    ),
    { ...size }
  );
}
