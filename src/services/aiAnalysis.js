const OpenAI = require('openai');
const { VertexAI } = require('@google-cloud/vertexai');

class AIAnalysisService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        this.vertexAI = new VertexAI({
            project: process.env.GOOGLE_CLOUD_PROJECT_ID,
            location: 'us-central1',
        });
    }

    async analyzeZReport(zReportData) {
        try {
            // OpenAI ile analiz
            const analysis = await this.analyzeWithGPT(zReportData);
            
            // Vertex AI ile tahminleme
            const predictions = await this.predictWithVertexAI(zReportData);

            return {
                analysis,
                predictions,
                recommendations: this.generateRecommendations(analysis, predictions)
            };
        } catch (error) {
            console.error('AI Analysis error:', error);
            throw error;
        }
    }

    async analyzeWithGPT(zReportData) {
        const prompt = this.createAnalysisPrompt(zReportData);

        const completion = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Sen bir uzman finansal analist ve stok yönetimi danışmanısın. Z raporlarını analiz edip, işletme için önemli içgörüler ve öneriler sunuyorsun."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        });

        return completion.choices[0].message.content;
    }

    async predictWithVertexAI(zReportData) {
        const model = this.vertexAI.preview.getModel('text-bison@001');
        
        const prompt = this.createPredictionPrompt(zReportData);
        
        const prediction = await model.predict(prompt);
        return prediction.predictions[0];
    }

    createAnalysisPrompt(zReportData) {
        return `
        Aşağıdaki Z raporu verilerini analiz et ve şu konularda değerlendirme yap:
        
        1. Satış Trendleri
        2. Stok Durumu
        3. Kritik Ürünler
        4. İyileştirme Önerileri
        5. Risk Analizi

        Z Raporu Verileri:
        ${JSON.stringify(zReportData, null, 2)}

        Lütfen aşağıdaki formatta yanıt ver:
        1. ÖZET:
        2. DETAYLI ANALİZ:
        3. ÖNERİLER:
        4. RİSKLER:
        5. EYLEM PLANI:
        `;
    }

    createPredictionPrompt(zReportData) {
        return `
        Bu Z raporu verilerine dayanarak:
        1. Gelecek hafta için satış tahminleri
        2. Stok tükenme riski olan ürünler
        3. Potansiyel fırsatlar
        4. Olası riskler

        hakkında tahminlerde bulun.

        Veriler:
        ${JSON.stringify(zReportData, null, 2)}
        `;
    }

    generateRecommendations(analysis, predictions) {
        // Analiz ve tahminleri birleştirerek öneriler oluştur
        return {
            immediateActions: [], // Hemen yapılması gerekenler
            shortTerm: [],       // Kısa vadeli öneriler
            longTerm: []         // Uzun vadeli öneriler
        };
    }
}

module.exports = new AIAnalysisService(); 