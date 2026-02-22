type JsonLdScriptProps = {
  json: string;
};

const JsonLdScript = ({ json }: JsonLdScriptProps) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
);

export default JsonLdScript;
