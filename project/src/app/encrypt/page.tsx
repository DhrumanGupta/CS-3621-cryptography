"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { encrypt } from "@/encryption/lwe";
import { Ciphertext, PublicKey } from "@/encryption/types";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EncryptPage() {
  const [binaryString, setBinaryString] = useState<string>("");
  const [publicKeyJson, setPublicKeyJson] = useState<string>("");
  const [ciphertexts, setCiphertexts] = useState<Ciphertext[] | null>(null);
  const [showCiphertexts, setShowCiphertexts] = useState<boolean>(false);

  const validateBinaryString = (str: string): boolean => {
    return /^[01]+$/.test(str);
  };

  const validatePublicKey = (jsonStr: string): PublicKey | null => {
    try {
      const parsed = JSON.parse(jsonStr);
      // Basic validation - check if it has required fields
      if (
        parsed &&
        Array.isArray(parsed.elements) &&
        typeof parsed.n === "number" &&
        typeof parsed.q === "number"
      ) {
        return parsed as PublicKey;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleEncrypt = () => {
    // Validate binary string
    if (!binaryString.trim()) {
      toast.error("Please enter a binary string");
      return;
    }

    if (!validateBinaryString(binaryString.trim())) {
      toast.error("Binary string must only contain 0s and 1s");
      return;
    }

    // Validate public key
    if (!publicKeyJson.trim()) {
      toast.error("Please enter a public key JSON");
      return;
    }

    const publicKey = validatePublicKey(publicKeyJson.trim());
    if (!publicKey) {
      toast.error("Invalid public key JSON. Please check the format.");
      return;
    }

    // Encrypt each bit
    try {
      const bits = binaryString.trim().split("");
      const results: Ciphertext[] = [];

      for (const bit of bits) {
        const message = parseInt(bit, 10);
        const ciphertext = encrypt(publicKey, message);
        results.push(ciphertext);
      }

      setCiphertexts(results);
      setShowCiphertexts(false);
      toast.success(`Successfully encrypted ${results.length} bit(s)`);
    } catch (error) {
      toast.error(
        `Error during encryption: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error(`Failed to copy ${label} to clipboard`);
    }
  };

  const handleCopyCiphertexts = () => {
    if (ciphertexts !== null) {
      copyToClipboard(
        JSON.stringify(ciphertexts, null, 2),
        "Ciphertexts"
      );
    }
  };

  return (
    <div className="flex grow items-center justify-center p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>LWE Encryption</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="binary-input">Binary String (0s and 1s)</Label>
            <textarea
              id="binary-input"
              placeholder="Enter a string of 0s and 1s, e.g., 10101"
              value={binaryString}
              onChange={(e) => setBinaryString(e.target.value)}
              className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                "min-h-[80px] resize-y"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="public-key-input">Public Key (JSON)</Label>
            <textarea
              id="public-key-input"
              placeholder='Enter public key JSON, e.g., {"elements": [...], "n": 10, "q": 101}'
              value={publicKeyJson}
              onChange={(e) => setPublicKeyJson(e.target.value)}
              className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                "min-h-[120px] resize-y"
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleEncrypt}
              disabled={
                !binaryString.trim() ||
                !publicKeyJson.trim() ||
                !validateBinaryString(binaryString.trim())
              }
            >
              Encrypt
            </Button>
          </div>

          {ciphertexts !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ciphertexts</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCiphertexts(!showCiphertexts)}
                  >
                    {showCiphertexts ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCiphertexts}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
              {showCiphertexts && (
                <pre className="p-3 rounded-md bg-muted text-muted-foreground font-mono text-sm overflow-auto max-h-96">
                  {JSON.stringify(ciphertexts, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

