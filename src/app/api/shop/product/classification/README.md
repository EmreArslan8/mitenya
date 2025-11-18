# Endpoint Documentation: GET /api/shop/product/classification

## Description

This endpoint retrieves product information based on the provided HS code or product ID. It can return various fields such as the HS code, IKPU code, and IKPU package code.

## URL

QA Base URL: `https://shop-qa.bringist.com`
Prod Base URL: `https://shop.bringist.com`
Endpoint Route: `/api/shop/product/classification`

## Method

`GET`

## Query Parameters

- `id`, `hs`, `productDetails` (string, optional): At least one of these should be provided.
- `fields` (array of strings, optional): The fields to return. Possible values are:

  - `hs`: The HS code of the product.
  - `ikpu`: The IKPU code mapped from the HS code.

  If no fields are specified, the endpoint defaults to returning the `hs` field.

## Response

### Success Response

- **Code**: 200 OK
- **Content**:
  ```json
  {
    "result": {
      "hs": {
        "hsCode": "HS_CODE",
        "hsName": "HS_NAME"
      },
      "ikpu": {
        "ikpuCode": "IKPU_CODE",
        "ikpuPackageCode": "IKPU_PACKAGE_CODE",
        "ikpuName": "IKPU_NAME",
        "ikpuNameRu": "IKPU_NAME_RU",
        "note": "Multiple IKPUs found, best one picked" // This field is only present if multiple IKPUs were found.
      }
    }
  }
  ```
  The response will include only the fields requested in the `fields` query parameter.

### Error Responses

- **Code**: 400 Bad Request
- **Content**:

  ```json
  {
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Bad request: at least one of id, hs or productDetails is required"
    }
  }
  ```

  This error occurs if neither `id`, `hs` or `productDetails` is provided.

- **Code**: 500 Internal Server Error
- **Content**:

  ```json
  {
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "An unexpected error occurred while processing your request. Please try again later."
    }
  }
  ```

  This error occurs if there is an issue processing the request.

- **Code**: 500 Internal Server Error
- **Content**:

  ```json
  {
    "error": {
      "code": "HS_CODE_INFERENCE_FAILED",
      "message": "Could not infer HS code from the provided product details."
    }
  }
  ```

  This error occurs if the HS code could not be inferred from the product details.

- **Code**: 500 Internal Server Error
- **Content**:
  ```json
  {
    "error": {
      "code": "IKPU_MULTIPLE_FOUND",
      "message": "Could not determine the best IKPU as multiple IKPUs were found. Please provide the product id (id) or product details (productDetails) in the request for better accuracy."
    }
  }
  ```
  This error occurs if multiple IKPUs were found and the best one could not be picked without additional product details.
