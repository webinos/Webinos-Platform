package de.fhg.fokus.fame.tools.widlproc2JS;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class WIDLProc2JS {

	private static String OUTPUT_FILENAME = "compiled.js";
	
	public static void main(String[] args) {
		
		String[] files = new String[0];
		
		//if no input args take all xml files in current directory
		//TODO: currently the webinos core xml should not be used / should not
		//      be available in the working derectory because
		//      it will override all previous webinos definitions
		if (args.length == 0){
			File directory = new File (".");
			files = directory.list(new FilenameFilter() {
				
				@Override
				public boolean accept(File dir, String name) {
					if (name.endsWith(".xml")) return true;
					return false;
				}
			});
		}
		else{
			files = args;
		}
		
		//For testing use explicit XML
		//files = new String[1];
		//files[0] = "payment.xml";
		
        DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder;
        Document doc = null;
		
        //bad hack for clearing the output / compilation file
        //in case it already exist
		FileWriter outFilex;
		try {
			outFilex = new FileWriter(OUTPUT_FILENAME);
			PrintWriter outx = new PrintWriter(outFilex);
			outx.close();
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

        //parse each givin xml file
        for (String file : files){
        	try {
				docBuilder = docBuilderFactory.newDocumentBuilder();
				doc = docBuilder.parse (new File(file));
			
				doc.getDocumentElement ().normalize ();
			} catch (ParserConfigurationException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (SAXException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			if (doc != null) new WIDLProc2JS().parse(doc,file + ".js");
        }
        
        System.out.println("Done parsing given sources.");
  
        //compile all resulting JS files into one big JS file
        compile(files, OUTPUT_FILENAME);
        
        System.out.println("Everything Done!");
      
	}
	
	/**
	 * Transforming a given XML Document into a JS file
	 * @param xml a widl proc XML file
	 * @param resultingFile The name of the resulting JS file
	 */
	public void parse(Document xml, String resultingFile){
		System.out.println("Starting parsing XML for " + resultingFile);
		
		try {
			FileWriter outFile = new FileWriter(resultingFile);
			PrintWriter out = new PrintWriter(outFile);
			
			NodeList module = xml.getElementsByTagName("Module");
				
			for (int i = 0; i < module.getLength(); i++){	
				ParserHelper.writeDescription(out, module.item(i), "");
				out.println("(function () {");
				ParserHelper.parseModule(module.item(i), out);
				out.println("}());");
			}
			out.close();
		} catch (IOException e){
			e.printStackTrace();
		}
	}
	
	/**
	 * Merges all given files into one big file
	 * @param files an array of JS files
	 * @param outfile file name of the compiled file
	 */
	public static void compile(String[] files, String outfile){
		 //copying all files together as one whole js script file
		System.out.println("Start compiling " + files.length + " files.");
		
		FileWriter outFile;
		try {
			outFile = new FileWriter(OUTPUT_FILENAME);
			PrintWriter out = new PrintWriter(outFile);
			
			FileInputStream fstream;
			String strLine;
			for (String file : files){
				if (file.endsWith(".js"))fstream = new FileInputStream(file);
				else fstream = new FileInputStream(file + ".js");

				  DataInputStream in = new DataInputStream(fstream);
				  BufferedReader br = new BufferedReader(new InputStreamReader(in));

				  while ((strLine = br.readLine()) != null)   {
				     out.println(strLine);
				  }
				  in.close();
			}
			out.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		System.out.println("Done Compiling");
	}
}
