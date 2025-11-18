/*
import 'server-only';

import bring from '@/lib/api/bring';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import hsToIkpuMapping from './hs-to-ikpu.json';

export const revalidate = 'force-cache';

type FieldOptions = 'hs' | 'ikpu';

type HSData = {
  hsCode: string;
  hsName: string;
};

type IKPUData = {
  ikpuCode: string;
  ikpuPackageCode: string;
  ikpuName: string;
  ikpuNameRu: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  const hsCode = searchParams.get('hs') ?? undefined;
  const _productDetails = searchParams.get('productDetails') ?? undefined;
  let fields = searchParams.getAll('fields') as FieldOptions[];
  fields = fields.length > 0 ? fields : ['hs'];

  if (!id && !hsCode && !_productDetails)
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Bad request: at least one of id, hs or productDetails is required',
        },
      },
      { status: 400 }
    );

  try {
    let hs: Partial<HSData> = { hsCode };
    let productDetails: string = _productDetails ?? '';
    if (id || !hsCode) {
      const [{ name, description, brand, attributes }, err] = await bring('/api/shop/product/', {
        params: { id: id!, rawDescriptionOnly: true },
      });
      if (!err) productDetails = JSON.stringify({ name, description, brand, attributes });
      const res = await inferHs(productDetails);
      if (!res?.hsCode)
        return NextResponse.json(
          {
            error: {
              code: 'HS_CODE_INFERENCE_FAILED',
              message: 'Could not infer HS code from the provided product details.',
            },
          },
          { status: 500 }
        );
      hs = res;
    }

    const result: Record<string, any> = {};
    if (fields.includes('hs')) result.hs = hs;

    if (fields.includes('ikpu')) {
      const ikpuData = mapHsToIkpu(hs.hsCode!);
      if (!ikpuData || ikpuData.length > 1) {
        if (!productDetails) {
          return NextResponse.json(
            {
              error: {
                code: 'IKPU_MULTIPLE_FOUND',
                message:
                  'Could not determine the best IKPU as multiple IKPUs were found. Please provide the product id (id) or product details (productDetails) in the request for better accuracy.',
              },
            },
            { status: 500 }
          );
        }
        let allIkpus = !ikpuData
          ? Object.entries(hsToIkpuMapping)
              .filter(([key, _]) => key.startsWith(hs.hsCode!.substring(0, 2)))
              .map(([_, value]) => value)
              .flat()
          : ikpuData;
        const ikpuCode = await pickBestIkpu(
          allIkpus.map(({ ikpuCode, ikpuName }) => ({ ikpuCode, ikpuName })),
          hs,
          productDetails
        );
        result.ikpu = allIkpus.find((ikpu) => ikpu.ikpuCode === ikpuCode);
        result.ikpu.note = 'Multiple IKPUs found, best one picked';
      } else {
        result.ikpu = ikpuData[0];
      }
    }

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred while processing your request. Please try again later.',
        },
      },
      { status: 500 }
    );
  }
};

const inferHs = async (data: string): Promise<{ hsCode: string; hsName: string } | null> => {
  try {
    const prompt = `You are an AI model that accepts a product description and returns an appropriate HS code and name for the product. The HS code should accurately represent the product described and should not include dots. Provide the HS code and name in a JSON format like {"hsCode": "your_hs_code", "hsName": "your_hs_name"}. Use the most specific HS code possible according to the available information on the product. If the description is unclear or non-sensical, return an empty JSON object.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: `system`, content: `${prompt}\n\nProduct description: ${data}` }],
    });
    const cleanedResponse = response.choices[0].message
      .content!.trim()
      .replace(/```json/g, '')
      .replace(/```/g, '');
    const result = JSON.parse(cleanedResponse);
    if (!result.hsCode) throw new Error('did not receive HS code');
    return result;
  } catch (error) {
    console.log('error inferring HS code:', error);
    return null;
  }
};

const mapHsToIkpu = (hsCode: string): IKPUData[] | null => {
  try {
    const ikpuList = (hsToIkpuMapping as any)[hsCode];
    return ikpuList;
  } catch (error) {
    console.error('Error mapping HS code to IKPU', error);
    return null;
  }
};

const pickBestIkpu = async (
  ikpuList: Partial<IKPUData>[],
  hs: Partial<HSData>,
  productDetails: string
): Promise<string> => {
  try {
    const prompt = `You are an AI model that accepts product details and a list of IKPU options. Your task is to pick the best IKPU from the list based on the product details. Return only the best IKPU in a JSON format like {"ikpuCode": "your_ikpu_code", "ikpuName": "your_ikpu_name"} without any comments. Here are the product details: ${productDetails} ${JSON.stringify(
      hs
    )}. Here are the IKPU options: ${JSON.stringify(ikpuList)}`;

    console.log('prompt', prompt);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: `system`, content: prompt }],
    });
    const cleanedResponse = response.choices[0].message
      .content!.trim()
      .replace(/```json/g, '')
      .replace(/```/g, '');
    const result = JSON.parse(cleanedResponse);
    if (!result.ikpuCode) throw new Error('did not receive IKPU code');
    return result.ikpuCode;
  } catch (error) {
    console.log('error picking best IKPU:', error);
    return ikpuList[0].ikpuCode!;
  }
};

*/
