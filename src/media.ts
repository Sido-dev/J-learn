export async function requestRecordingStream(){
 // A development-only fixture exercises denied-permission UI without requesting a real microphone.
 if(import.meta.env.DEV&&new URLSearchParams(location.search).get('qaMic')==='denied')throw new DOMException('Simulated permission denial','NotAllowedError');
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('This browser cannot record audio here. Practise aloud without recording.');
 return navigator.mediaDevices.getUserMedia({audio:true});
}
