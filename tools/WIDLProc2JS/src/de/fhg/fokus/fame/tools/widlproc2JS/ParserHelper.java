package de.fhg.fokus.fame.tools.widlproc2JS;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.regex.Pattern;

import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class ParserHelper {

	/**
	 * Gets the value of a specific attribute attached to the given node
	 * @param node
	 * @param attrName
	 * @return
	 */
	static String getAttributeValue(Node node, String attrName) {
		if (node == null) return null;;
		NamedNodeMap map = node.getAttributes();
		if (map != null && map.getNamedItem(attrName) != null)
			return map.getNamedItem(attrName).getTextContent();
		else
			return null;
	}

	/**
	 * Gets the first node with a specific name
	 * @param name
	 * @param nodeList
	 * @return
	 */
	static Node getNodeByName(String name, NodeList nodeList) {
		for (int i = 0; i < nodeList.getLength(); i++) {
			if (nodeList.item(i).getNodeName().equals(name)) {
				return nodeList.item(i);
			}
		}
		return null;
	}
	
	/**
	 * Gets all nodes with a specific name
	 * @param name
	 * @param nodeList
	 * @return
	 */
	static ArrayList<Node> getNodesByName(String name, NodeList nodeList) {
		ArrayList<Node> nodes = new ArrayList<Node>();
		
		for (int i = 0; i < nodeList.getLength(); i++) {
			if (nodeList.item(i).getNodeName().equals(name)) {
				nodes.add(nodeList.item(i));
			}
		}
		return nodes;
	}

	/**
	 * Gets an interface child node of the given node with the given name
	 * @param interfaceName
	 * @param node
	 * @return
	 */
	static Node getInterfaceNodeByName(String interfaceName, Node node) {
		ArrayList<Node> nodes =  getNodesByName("Interface", node.getChildNodes());
		
		for (int i = 0; i < nodes.size(); i++) {
			if (getAttributeValue(nodes.get(i), "name").equals(interfaceName)) {
				return nodes.get(i);
			}
		}
		return null;
	}

	/**
	 * Checks if a given interface is declared in the module
	 * @param interfaceName
	 * @param module
	 * @return
	 */
	static boolean existInterfaceByName(String interfaceName, Node module) {
		ArrayList<Node> nodes = getNodesByName("Interface", module.getChildNodes());
		
		for (int i = 0; i < nodes.size(); i++) {
			if (getAttributeValue(nodes.get(i), "name").equals(interfaceName)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Parses a giving module and writes it into the giving output stream
	 * @param module
	 * @param out
	 */
	static void parseModule(Node module, PrintWriter out) {
		ArrayList<Node> nodes = getNodesByName("Implements", module.getChildNodes());
		
		if (nodes.size() == 0){
			System.out.println("Error: Module " + getAttributeValue(module,"name") + " does not contain an IMPLEMENTS element!");
			return;
		}
		
		for (int i = 0; i < nodes.size(); i++) {
			String root = getAttributeValue(nodes.get(i), "name1");

			Node n1 = getNodeByName("webidl", nodes.get(i).getChildNodes());
			Node n2 = getNodeByName("ref", n1.getChildNodes());

			root = n2.getTextContent().toLowerCase();
			if (root.contains("::")) {
				String[] a = root.split("::");
				root = a[a.length - 1];
			}

			String implementationTarget = getAttributeValue(nodes.get(i),
					"name2");

			Node implTarget = getInterfaceNodeByName(implementationTarget, module);

			if (implTarget == null) {
				System.out.println("No implementation target found for "
						+ implementationTarget + "!");
				continue;
			}

			NodeList childs = implTarget.getChildNodes();
			Node child;
			String attrType = null;
			for (int j = 0; j < childs.getLength(); j++) {
				child = childs.item(j);
				if (child.getNodeName().equals("Attribute")) {
					String attrName = getAttributeValue(child, "name")
							.toLowerCase();

					NodeList attributeChilds = child.getChildNodes();
					attrType = getAttributeValue(
							getNodeByName("Type", attributeChilds), "name");
					if (existInterfaceByName(attrType, module)) {

						if (root.equalsIgnoreCase("window")) {
							root = "";
							out.println("    if (typeof " + attrName
									+ " === \"undefined\") { " + attrName
									+ " = {}; }");
						} else {
							out.println();
							out.println("    //making namespaces");
							out.println("    if (typeof " + root
									+ " === \"undefined\") { " + root
									+ " = {}; }");
							out.println("    if (!" + root + "." + attrName
									+ ") { " + root + "." + attrName
									+ " = {}; }");
							
							root = root + ".";
						}
						
						
						ArrayList<Node> interfaces = getNodesByName("Interface", module.getChildNodes());
						
						out.println();
						out.print("    var ");
						String tmpOut = "";
						for (int iFaces = 0; iFaces < interfaces.size(); iFaces++){
							tmpOut += getAttributeValue(interfaces.get(iFaces), "name") + ", ";
						}
						if (tmpOut.length() > 0) tmpOut = tmpOut.substring(0,tmpOut.length()-2) + ";";
						out.println(tmpOut);
						
						
						Node main = null;
						for (int iFaces = 0; iFaces < interfaces.size(); iFaces++){
							if (!getAttributeValue(interfaces.get(iFaces), "name").equals(attrType)
							){
								parseProtoypes(module, interfaces.get(iFaces), out);
							}
							else{
								main = interfaces.get(iFaces);
							}
						}
						
						parseProtoypes(module, main, out, true);
						
						if (existInterfaceByName(attrType, module)){
							if (root.equalsIgnoreCase("window")) {
								out.println("    " + attrName + " = new " + attrType + "();");
							} else {
								out.println("    " + root + attrName + " = new " + attrType + "();");
							}
						}

						parseStaticInterface(attrType, module, root + attrName, out);
					} else {
						System.out.println("There is no interface " + attrName
								+ " defined!");
					}
				}
			}
		}
	}
	
	private static void parseProtoypes(Node module, Node iFace, PrintWriter out){
		parseProtoypes(module, iFace, out, false);
	}
	
	/**
	 * Parse and write an interface with prototypes
	 * @param module
	 * @param iFace
	 * @param out
	 * @param onlyAttributes Only writes attributes in object/function specification 
	 *        of the interfaces but not const and functions
	 */
	private static void parseProtoypes(Node module, Node iFace, PrintWriter out, boolean onlyAttributes){
		String outline = "";
		Node child = null;
		
		writeDescription(out, iFace, "    ");
		String interFaceName = getAttributeValue(iFace, "name");
		out.println("    " + interFaceName + " = function () {");
		out.println("        //TODO implement constructor logic if needed!");
		out.println();
		
		// write attributes
		ArrayList<Node> attributes = getNodesByName("Attribute", iFace.getChildNodes());

		if (attributes.size() > 0){
			out.println("        //TODO initialize attributes");
			out.println();
		}
		
		String dataType = "";
		for (Node n : attributes) {
			
			outline = "        this." + getAttributeValue(n, "name");
			
			child = getNodeByName("Type", n.getChildNodes());
			if (child != null){
				dataType = getAttributeValue(child, "type");
				if (dataType != null){
					if (dataType.equalsIgnoreCase("DOMString")) outline	+= " = String;";
					else if (dataType.equalsIgnoreCase("boolean")) outline	+= " = Boolean;";
					else outline	+= " = Number;";
				}
				else{
					dataType = getAttributeValue(child, "name");
					if (dataType != null){
						
						if (existInterfaceByName(dataType, module)){
							
							if (!dataType.equalsIgnoreCase(interFaceName))outline	+= " = new " + dataType + "();";
							else outline += " = null;";
						}
						else{
							if (dataType.equalsIgnoreCase("date")) outline	+= " = new " + dataType + "();";
							else if (dataType.endsWith("Array")) outline	+= " = new Array();";
							else{
								outline	+= " = \"new " + dataType + "()\";";
								System.out.println("Warning: Datatype " + dataType + " is not specified in module");
							}
						}
					}
					else{
						outline += " = null ;";
					}
				}
			}
			out.println(outline);
		}
				
		out.println("    };");
		
		if (onlyAttributes) return;
		
		// write constants
		ArrayList<Node> consts = getNodesByName("Const", iFace.getChildNodes());
		for (Node n : consts) {
			writeDescription(out, n, "    ");
			
			String value = getAttributeValue(n, "value");
			if (value == null && getAttributeValue(n, "stringvalue") != null) value = "\"" + getAttributeValue(n, "stringvalue") + "\"";
			
			outline = "    " + interFaceName + ".prototype." + getAttributeValue(n, "name")
					+ " = " + value + ";";
			out.println(outline);
		}
		
		// write attributes
		attributes = getNodesByName("Attribute", iFace.getChildNodes());
		dataType = "";

		for (Node n : attributes) {
			writeDescription(out, n, "    ");
			outline = "    " + interFaceName + ".prototype." + getAttributeValue(n, "name");
			
			child = getNodeByName("Type", n.getChildNodes());
			if (child != null){
				dataType = getAttributeValue(child, "type");
				if (dataType != null){
					if (dataType.equalsIgnoreCase("DOMString")) outline	+= " = String;";
					else if (dataType.equalsIgnoreCase("boolean")) outline	+= " = Boolean;";
					else outline	+= " = Number;";
				}
				else{
					//if data type is an Object initialize with NULL
					outline += " = null;";
				}
			}
			out.println(outline);
		}
		
		
		ArrayList<Node> operations = getNodesByName("Operation", iFace.getChildNodes());
		// write operations
		for (Node n : operations) {
			writeDescription(out, n, "    ");
			outline = "    " + interFaceName + ".prototype." + getAttributeValue(n, "name")
					+ " = function (";

			Node arguments = getNodeByName("ArgumentList", n.getChildNodes());
			child = null;
			String attrValue = null;
			for (int j = 0; j < arguments.getChildNodes().getLength(); j++) {
				child = arguments.getChildNodes().item(j);
				attrValue = getAttributeValue(child, "name");
				if (attrValue != null) {
					outline += attrValue;
					if (j < arguments.getChildNodes().getLength())
						outline += ", ";
				}
			}
			if (outline.endsWith(", "))
				outline = outline.substring(0, outline.length() - 2);
			outline += ") {\n        //TODO: Add your application logic here!\n\n";

			String operationType = getAttributeValue(
					getNodeByName("Type", n.getChildNodes()), "name");
			if (operationType != null) {
				if (!Pattern.compile("^[A-Z0-9]").matcher(operationType).find()){
					System.out.println("Warning: Construcor name " + operationType + " in " + getAttributeValue(iFace, "name") + " should be uppercase");
				}
				
				outline += "        return new " + operationType + "();\n";
			}
			
			operationType = getAttributeValue(
					getNodeByName("Type", n.getChildNodes()), "type");
			
			if (operationType != null) {
				if (operationType.equalsIgnoreCase("domstring")) operationType = " String";
				else if (operationType.equalsIgnoreCase("boolean")) operationType = " Boolean";
				else if (operationType.equalsIgnoreCase("void")) operationType = ""; 
				else operationType = " Number";
				outline += "        return" + operationType + ";\n";
			}

			outline += "    };";

			out.println(outline);

		}
		
	}

	/**
	 * Gets all nodes of a module that are child of a given interface and have
	 * a specific name
	 * @param module The module that contains the given interface
	 * @param interfaceName the interface to be used for search nodes/childs
	 * @param nodeName the node name to be used for select nodes as result
	 * @return list of Nodes that have a specific name and are part of a
	 *         specific interface
	 */
	static ArrayList<Node> getNodes(Node module, String interfaceName,
			String nodeName) {
		Node iFace = getInterfaceNodeByName(interfaceName, module);
		NodeList childs = iFace.getChildNodes();
		ArrayList<Node> operations = new ArrayList<Node>();
		Node child;
		for (int i = 0; i < childs.getLength(); i++) {
			child = childs.item(i);
			if (child.getNodeName().equals(nodeName)) {
				operations.add(child);
			}
		}
		return operations;
	}

	/**
	 * Parse an interface as 'static' interface
	 * @param interfaceName
	 * @param module
	 * @param nameSpace
	 * @param out
	 */
	static void parseStaticInterface(String interfaceName, Node module,
			String nameSpace, PrintWriter out) {
		String outline = "";

		Node child = null;

		// write constants
		ArrayList<Node> consts = getNodes(module, interfaceName, "Const");
		for (Node n : consts) {
			writeDescription(out, n, "    ");
			
			String value = getAttributeValue(n, "value");
			if (value == null && getAttributeValue(n, "stringvalue") != null) value = "\"" + getAttributeValue(n, "stringvalue") + "\"";
			outline = "    " + nameSpace + "." + getAttributeValue(n, "name")
					+ " = " + value + ";";
				
			out.println(outline);
		}

		// write attributes
		ArrayList<Node> attributes = getNodes(module, interfaceName, "Attribute");

		String dataType = "";
		for (Node n : attributes) {
			writeDescription(out, n, "    ");
			outline = "    " + nameSpace + "." + getAttributeValue(n, "name");
			
			child = getNodeByName("Type", n.getChildNodes());
			if (child != null){
				dataType = getAttributeValue(child, "type");
				if (dataType != null){
					if (dataType.equalsIgnoreCase("DOMString")) outline	+= " = String;";
					else if (dataType.equalsIgnoreCase("boolean")) outline	+= " = Boolean;";
					else outline	+= " = Number;";
				}
				else{
					dataType = getAttributeValue(child, "name");
					if (dataType != null){
						
						if (existInterfaceByName(dataType, module)){
							outline	+= " = new " + dataType + "();";
						}
						else{
							if (dataType.equalsIgnoreCase("date")) outline	+= " = new " + dataType + "();";
							else if (dataType.endsWith("Array")) outline	+= " = new Array();";
							else{
								outline	+= " = \"new " + dataType + "()\";";
								System.out.println("Warning: Datatype " + dataType + " is not specified in module");
							}
						}
					}
					else{
						//if data type is an Object initialize with NULL
						outline += " = null;";
					}
				}
			}
			out.println(outline);
		}

		ArrayList<Node> operations = getNodes(module, interfaceName, "Operation");
		// write operations
		for (Node n : operations) {
			writeDescription(out, n, "    ");
			outline = "    " + nameSpace + "." + getAttributeValue(n, "name")
					+ " = function (";

			Node arguments = getNodeByName("ArgumentList", n.getChildNodes());
			child = null;
			String attrValue = null;
			for (int j = 0; j < arguments.getChildNodes().getLength(); j++) {
				child = arguments.getChildNodes().item(j);
				attrValue = getAttributeValue(child, "name");
				if (attrValue != null) {
					outline += attrValue;
					if (j < arguments.getChildNodes().getLength())
						outline += ", ";
				}
			}
			if (outline.endsWith(", "))
				outline = outline.substring(0, outline.length() - 2);
			outline += ") {\n        //TODO: Add your application logic here!\n\n";

			String operationType = getAttributeValue(
					getNodeByName("Type", n.getChildNodes()), "name");
			if (operationType != null) {
				if (!Pattern.compile("^[A-Z0-9]").matcher(operationType).find()){
					System.out.println("Warning: Construcor name " + operationType + " in " + interfaceName + " should be uppercase");
				}
				
				outline += "        return new " + operationType + "();\n";
			}
			

			
			operationType = getAttributeValue(
					getNodeByName("Type", n.getChildNodes()), "type");
			
			if (operationType != null) {
				if (operationType.equalsIgnoreCase("domstring")) operationType = " String";
				else if (operationType.equalsIgnoreCase("boolean")) operationType = " Boolean";
				else if (operationType.equalsIgnoreCase("void")) operationType = ""; 
				else operationType = " Number";
				outline += "        return" + operationType + ";\n";
			}

			outline += "    };";

			out.println(outline);

		}

	}
	
	/**
	 * Parses and writes the description of a given Node into the output stream
	 * @param out The output stream to write in
	 * @param node The affected Node
	 * @param offSet The offset that should be used before each line (commonly empty spaces)
	 */
	public static void writeDescription(PrintWriter out, Node node, String offSet){
		Node childNodeDescriptive = null;
		Node childNodeBrief = null;
		Node childNodeDescription = null;
		
		if (node == null) return;
		
		childNodeDescriptive = getNodeByName("descriptive", node.getChildNodes());
		
		if (childNodeDescriptive == null) return;
		
		childNodeBrief = getNodeByName("brief", childNodeDescriptive.getChildNodes());
		childNodeDescription = getNodeByName("description", childNodeDescriptive.getChildNodes());
		
		String desc = "";
		
		String outline  = "\n" + offSet + "/**";
	    
		if (childNodeBrief != null){
			desc = childNodeBrief.getTextContent().trim().replace("\n", "\n" + offSet + " * ");
			outline += "\n" + offSet + " * " + desc;
		}
		
		if (!outline.endsWith(" * "))outline += "\n" + offSet + " *";
		
		if (childNodeDescription != null){
			NodeList l = childNodeDescription.getChildNodes();
			for (int i = 0; i < l.getLength(); i++){
				desc = childNodeDescription.getChildNodes().item(i).getTextContent().trim().replace("\n", "\n" + offSet + " * ");
				outline += "\n" + offSet + " * " + desc;
			}
		}
		
		//TODO add code examples
		
		//TODO add param descriptions and return value descriptions 
		
		//TODO add throws description 
	    
		outline += "\n" + offSet + " */";
	    out.println(outline);
	}
	
}
