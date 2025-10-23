const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

const speechToText = async (audioBuffer) => {
  try {
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };

    const request = {
      audio,
      config,
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    return transcription;
  } catch (error) {
    console.error('Speech-to-Text Error:', error);
    throw new Error('Failed to transcribe audio');
  }
};

const textToSpeechConvert = async (text, languageCode = 'en-US') => {
  try {
    const request = {
      input: { text },
      voice: {
        languageCode,
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    console.error('Text-to-Speech Error:', error);
    throw new Error('Failed to convert text to speech');
  }
};

module.exports = {
  speechToText,
  textToSpeechConvert,
};
