///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:07
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
#if !CF
using System.Runtime.Serialization;
#endif
using System.Collections;
using policyDB.FactoryClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.HelperClasses
{
	/// <summary>
	/// Helper class which will eases the creation of custom made resultsets. Usable in typed lists
	/// and dynamic lists created using the dynamic query engine.
	/// </summary>
	[Serializable]
	public partial class ResultsetFields : EntityFields, ISerializable
	{
		/// <summary>CTor</summary>
		public ResultsetFields(int amountFields) : base(amountFields, InheritanceInfoProviderSingleton.GetInstance(), null)
		{
		}
		
		/// <summary>Deserialization constructor</summary>
		/// <param name="info">Info.</param>
		/// <param name="context">Context.</param>
		protected ResultsetFields(SerializationInfo info, StreamingContext context):base((int)info.GetInt32("_amountFields"), InheritanceInfoProviderSingleton.GetInstance(), null)
		{
			ArrayList fields = (ArrayList)info.GetValue("_fields", typeof(ArrayList));
			for (int i = 0; i < fields.Count; i++)
			{
				this[i] = (IEntityField)fields[i];
			}
		}

		/// <summary>Populates a <see cref="T:System.Runtime.Serialization.SerializationInfo"/> with the data needed to serialize the target object.</summary>
		/// <param name="info">The <see cref="T:System.Runtime.Serialization.SerializationInfo"/> to populate with data.</param>
		/// <param name="context">The destination (see <see cref="T:System.Runtime.Serialization.StreamingContext"/>) for this serialization.</param>
		public virtual void GetObjectData(SerializationInfo info, StreamingContext context)
		{
			info.AddValue("_amountFields", this.Count);
			ArrayList fields = new ArrayList(this.Count);
			for (int i = 0; i < this.Count; i++)
			{
				fields.Add(this[i]);
			}
			info.AddValue("_fields", fields, typeof(ArrayList));
		}

		#region Included Code

		#endregion
	}
}
